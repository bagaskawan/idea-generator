import os
import json
import uuid
import logging
from groq import Groq
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
from ..models import EditorCompletionRequest
from pydantic import BaseModel
from typing import List, Optional, Any, Dict
from dotenv import load_dotenv

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# Validate API key
groq_api_key = os.getenv("GROQ_API_KEY")
if not groq_api_key or len(groq_api_key.strip()) < 20:
    logger.error("GROQ_API_KEY is missing or invalid!")
    raise ValueError("GROQ_API_KEY is not properly configured")

client = Groq(api_key=groq_api_key)
model_llm = "llama-3.3-70b-versatile"

logger.info(f"AI Router initialized with Groq model: {model_llm}")

# BlockNote AI System Prompt (from BlockNote's aiDocumentFormats.html.systemPrompt)
BLOCKNOTE_SYSTEM_PROMPT = """You are a helpful AI assistant integrated into a rich text editor. 
Your task is to help users with their writing by following their instructions precisely.
When making changes to the document, use the provided tools to insert, update, or delete content.
Always respond with tool calls to modify the document as requested."""



class BlockNoteChatRequest(BaseModel):
    messages: List[Any]
    toolDefinitions: Optional[List[Any]] = None


def generate_id():
    """Generate a unique ID for message parts"""
    return f"msg_{uuid.uuid4().hex}"


def convert_tool_definitions_to_groq(tool_definitions: Dict[str, Any]) -> List[Dict]:
    """Convert BlockNote toolDefinitions to Groq function format"""
    groq_tools = []
    
    for tool_name, tool_def in tool_definitions.items():
        groq_tool = {
            "type": "function",
            "function": {
                "name": tool_name,
                "description": tool_def.get("description", f"Tool to {tool_name}"),
                "parameters": tool_def.get("inputSchema", {"type": "object", "properties": {}})
            }
        }
        groq_tools.append(groq_tool)
    
    return groq_tools


def build_document_context(messages: List[Any]) -> str:
    """Extract document state from messages to build context"""
    context_parts = []
    
    for msg in messages:
        metadata = msg.get("metadata", {})
        doc_state = metadata.get("documentState", {})
        
        if doc_state:
            # Add selected blocks info
            selected = doc_state.get("selectedBlocks", [])
            if selected:
                context_parts.append("## Selected blocks (to be modified):")
                for block in selected:
                    block_id = block.get("id", "")
                    block_html = block.get("block", "")
                    context_parts.append(f"- Block ID: {block_id}")
                    context_parts.append(f"  HTML: {block_html}")
            
            # Add surrounding document context (limited)
            all_blocks = doc_state.get("blocks", [])
            if all_blocks and len(all_blocks) <= 10:
                context_parts.append("\n## Document context:")
                for i, block in enumerate(all_blocks[:10]):
                    context_parts.append(f"{i+1}. {block.get('block', '')}")
    
    return "\n".join(context_parts)


async def stream_sse_response(messages: List[Any], tool_definitions: Optional[Dict[str, Any]] = None):
    """
    Generate SSE streaming response compatible with Vercel AI SDK's toUIMessageStreamResponse.
    Supports tool calling for BlockNote AI operations.
    """
    message_id = generate_id()
    logger.info(f"[BlockNote AI] Starting SSE stream {message_id}")
    logger.info(f"[BlockNote AI] Received {len(messages)} messages")
    logger.info(f"[BlockNote AI] Tool definitions present: {bool(tool_definitions)}")
    
    try:
        # Convert BlockNote messages to Groq format
        groq_messages = []
        document_context = build_document_context(messages)
        
        for msg in messages:
            role = msg.get("role", "user")
            content = ""
            
            # Handle different message formats
            if isinstance(msg.get("content"), str):
                content = msg["content"]
            elif isinstance(msg.get("content"), list):
                for part in msg["content"]:
                    if isinstance(part, dict) and part.get("type") == "text":
                        content += part.get("text", "")
                    elif isinstance(part, str):
                        content += part
            elif msg.get("parts"):
                for part in msg["parts"]:
                    if isinstance(part, dict) and part.get("type") == "text":
                        content += part.get("text", "")
            
            if content:
                groq_messages.append({
                    "role": role if role in ["user", "assistant", "system"] else "user",
                    "content": content
                })
        
        # Build enhanced system prompt with document context
        system_prompt = f"""{BLOCKNOTE_SYSTEM_PROMPT}

{document_context}

IMPORTANT: You MUST use the applyDocumentOperations tool to make changes. Respond ONLY with tool calls, no text."""
        
        groq_messages.insert(0, {"role": "system", "content": system_prompt})
        
        # Convert tool definitions
        groq_tools = []
        if tool_definitions and isinstance(tool_definitions, dict):
            groq_tools = convert_tool_definitions_to_groq(tool_definitions)
            logger.info(f"[BlockNote AI] Converted {len(groq_tools)} tool definitions")
        
        logger.info(f"[BlockNote AI] Total messages for Groq: {len(groq_messages)}")
        logger.debug(f"[BlockNote AI] Groq messages: {json.dumps(groq_messages, indent=2)}")
        
        # Start message
        yield f"data: {json.dumps({'type': 'start', 'messageId': message_id})}\n\n"
        
        # Start step
        yield f"data: {json.dumps({'type': 'start-step'})}\n\n"
        
        # Call Groq with function calling
        if groq_tools:
            logger.info(f"[BlockNote AI] Calling Groq with {len(groq_tools)} tools...")
            response = client.chat.completions.create(
                messages=groq_messages,
                model=model_llm,
                temperature=0.7,
                max_completion_tokens=4000,
                tools=groq_tools,
                tool_choice="required",  # Force tool usage
            )
            
            logger.info(f"[BlockNote AI] Groq response received")
            
            # Handle tool calls in response
            choice = response.choices[0]
            
            if choice.message.tool_calls:
                logger.info(f"[BlockNote AI] Got {len(choice.message.tool_calls)} tool calls")
                for tool_call in choice.message.tool_calls:
                    tool_call_id = tool_call.id
                    tool_name = tool_call.function.name
                    tool_args = tool_call.function.arguments
                    
                    logger.info(f"[BlockNote AI] Tool call: {tool_name}")
                    logger.debug(f"[BlockNote AI] Tool args: {tool_args}")
                    
                    # Parse arguments
                    try:
                        parsed_args = json.loads(tool_args)
                    except json.JSONDecodeError as e:
                        logger.error(f"[BlockNote AI] Failed to parse tool args: {e}")
                        parsed_args = {}
                    
                    # Emit tool call events per AI SDK v5 protocol
                    # For client-side tools like BlockNote's applyDocumentOperations,
                    # we only send input events. The client executes the tool and handles output.
                    
                    # 1. Tool input start - indicates tool call beginning
                    yield f"data: {json.dumps({'type': 'tool-input-start', 'toolCallId': tool_call_id, 'toolName': tool_name})}\n\n"
                    
                    # 2. Tool input available - complete input is ready for client-side execution
                    yield f"data: {json.dumps({'type': 'tool-input-available', 'toolCallId': tool_call_id, 'toolName': tool_name, 'input': parsed_args})}\n\n"
                    
                    # Note: Do NOT send tool-output-available here!
                    # BlockNote AI executes applyDocumentOperations client-side and handles output internally.
                    
                    logger.info(f"[BlockNote AI] Sent tool input events for {tool_name}")
            else:
                logger.warning(f"[BlockNote AI] No tool calls in response despite having tools")
            
            # If there's also text content
            if choice.message.content:
                text_id = generate_id()
                yield f"data: {json.dumps({'type': 'text-start', 'id': text_id})}\n\n"
                yield f"data: {json.dumps({'type': 'text-delta', 'id': text_id, 'delta': choice.message.content})}\n\n"
                yield f"data: {json.dumps({'type': 'text-end', 'id': text_id})}\n\n"
        else:
            logger.info(f"[BlockNote AI] No tools provided, streaming text response")
            # No tools - stream text response
            text_id = generate_id()
            yield f"data: {json.dumps({'type': 'text-start', 'id': text_id})}\n\n"
            
            stream = client.chat.completions.create(
                messages=groq_messages,
                model=model_llm,
                temperature=0.7,
                max_completion_tokens=2000,
                stream=True,
            )
            
            for chunk in stream:
                if chunk.choices and chunk.choices[0].delta.content:
                    delta_text = chunk.choices[0].delta.content
                    yield f"data: {json.dumps({'type': 'text-delta', 'id': text_id, 'delta': delta_text})}\n\n"
            
            yield f"data: {json.dumps({'type': 'text-end', 'id': text_id})}\n\n"
        
        # Finish step
        yield f"data: {json.dumps({'type': 'finish-step'})}\n\n"
        
        # Finish message
        yield f"data: {json.dumps({'type': 'finish'})}\n\n"
        
        # Stream termination
        logger.info(f"[BlockNote AI] Stream {message_id} completed successfully")
        yield "data: [DONE]\n\n"
        
    except Exception as e:
        logger.error(f"[BlockNote AI] Error in stream_sse_response: {e}")
        logger.error(f"[BlockNote AI] Error type: {type(e).__name__}")
        import traceback
        logger.error(f"[BlockNote AI] Traceback:\n{traceback.format_exc()}")
        
        # Send detailed error to client
        error_msg = {
            "type": "error", 
            "errorText": f"{type(e).__name__}: {str(e)}"
        }
        yield f"data: {json.dumps(error_msg)}\n\n"
        yield "data: [DONE]\n\n"


@router.post("/chat")
async def blocknote_chat(request: Request):
    """
    BlockNote AI chat endpoint - compatible with Vercel AI SDK's toUIMessageStreamResponse.
    Used by DefaultChatTransport in the frontend.
    """
    # Parse raw JSON body to handle AI SDK v5's flexible format
    body = await request.json()
    
    logger.info(f"[BlockNote AI] === NEW CHAT REQUEST ===")
    logger.info(f"[BlockNote AI] Request body keys: {list(body.keys())}")
    logger.debug(f"[BlockNote AI] Full request: {json.dumps(body, indent=2)}")
    
    # Extract messages - AI SDK v5 might use different field names
    messages = body.get("messages", [])
    tool_definitions = body.get("toolDefinitions") or body.get("tools") or []
    
    return StreamingResponse(
        stream_sse_response(messages, tool_definitions),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Vercel-AI-UI-Message-Stream": "v1",  # Required header for Vercel AI SDK
            "Access-Control-Expose-Headers": "X-Vercel-AI-UI-Message-Stream",
        }
    )


@router.post("/editor-completion")
async def editor_completion(request: EditorCompletionRequest):
    """
    Generate AI text completion for the BlockNote editor.
    Acts as a co-writer to continue or improve the user's text.
    """
    try:
        system_prompt = """You are a professional co-writer assistant. Your role is to:
1. Continue sentences naturally and coherently
2. Match the tone and style of the existing text
3. Provide direct, to-the-point responses without meta-commentary
4. Never explain what you're doing - just write the continuation

IMPORTANT RULES:
- Do NOT start with phrases like "Here's a continuation..." or "I'll help you..."
- Do NOT use quotation marks around your response
- Do NOT repeat the original text
- Just write the natural continuation of the text
- Keep responses concise (1-3 sentences unless more context suggests otherwise)"""

        # Build user message
        user_message = request.context
        if request.prompt:
            user_message = f"{request.prompt}\n\nContext:\n{request.context}"

        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            model=model_llm,
            temperature=0.7,
            max_completion_tokens=500,
        )

        response_text = chat_completion.choices[0].message.content.strip()

        return {"completion": response_text}

    except Exception as e:
        print(f"Error in editor-completion: {e}")
        raise HTTPException(status_code=500, detail=str(e))
