import os
import json
# import google.generativeai as genai
from groq import Groq
from fastapi import APIRouter, HTTPException
from ..models import StartInterviewRequest, IdeaRequest
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
model_llm = "openai/gpt-oss-120b"

@router.post("/start")
async def start_interview(request: StartInterviewRequest):
    if os.getenv("MOCK_AI_RESPONSES") == "true":
         # Return mock data if needed (Implement mock logic if required)
         pass

    prompt = f"""
      You are a friendly, highly experienced project consultant for software developer conducting a short but impactful interview.
      The user's initial interest is: "{request.interest}".

      Your mission is to unlock their vision by asking one single, most valuable follow-up question that helps clarify their core idea.

      Instructions:

      Language Match: Carefully analyze the language of the user's interest ("{request.interest}") and write your question in that exact same language.

      Tone: Keep your tone professional yet approachable, encouraging the user to think deeper. Avoid rigid formalities such as "Bapak/Ibu" or "Sir/Madam".

      Format: Your output MUST be a single, valid JSON object with only one key: "question". No extra commentary, no markdown, no additional fields.

      Impact: The question should spark clarity, highlight priorities, and guide the user to define the essence of their idea.

      Focus: Ask about the "Why" or the "Who" first.

      Example 1 (User input in Indonesian):

      User Interest: "Aplikasi kasir untuk warung kopi"

      Output: {{ "question": "Ide yang menarik! Menurut Anda, fitur apa yang paling penting untuk ada di versi pertama aplikasi ini?" }}

      Example 2 (User input in English):

      User Interest: "A workout planner app"

      Output: {{ "question": "Sounds exciting! Who do you see as the main target users for this workout planner?" }}
    """

    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user", 
                    "content": prompt 
                }
            ],
            model=model_llm,
            response_format={"type": "json_object"}, 
        )
        
        text = chat_completion.choices[0].message.content
        
        cleaned_text = text.replace("```json", "").replace("```", "").strip()
        data = json.loads(cleaned_text)
        
        return data

    except Exception as e:
        print(f"Error in start-interview API: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/continue")
async def continue_interview(request: IdeaRequest):
    model = model_llm
    question_count = len(request.conversation)
    
    prompt = f"""You are an expert project consultant conducting an ADAPTIVE interview to gather information for creating a software project blueprint.

CONTEXT:
- User initial interest: {request.interest}
- Conversation history: {json.dumps(request.conversation, default=str)}
- Current question count: {question_count}

YOUR MISSION:
Analyze the quality of the conversation so far and decide whether to CONTINUE asking questions or CONCLUDE the interview.

QUALITY ASSESSMENT CRITERIA:
1. Completeness: Does the information cover key aspects (features, users, goals, constraints)?
2. Clarity: Is the user vision clear and specific, or vague and ambiguous?
3. Depth: Are answers detailed with insights, or surface-level and generic?
4. Actionability: Can you create a concrete, comprehensive project blueprint from this information?

DECISION RULES:
- MINIMUM: At least 2 questions must be asked before concluding
- MAXIMUM: Hard limit of 10 questions total
- CONFIDENCE THRESHOLD: If overall score is 0.75 or higher AND question count is 2 or more, you MAY conclude
- NEED MORE: If answers are vague, contradictory, or missing critical details, CONTINUE
- CRITICAL GAPS: If essential information is missing (target users, core features, main problem), CONTINUE

CALCULATE:
- overall_score = average of completeness, clarity, depth, actionability (all values between 0.0 and 1.0)
- confidence = overall_score

DECISION LOGIC:
- If question_count is 10 or more: set shouldContinue to false, reason is max_reached
- Else if question_count is less than 2: set shouldContinue to true, reason is need_more_context
- Else if overall_score is 0.75 or higher: set shouldContinue to false, reason is sufficient_info
- Else: set shouldContinue to true, reason is need_clarification

LANGUAGE MATCHING:
- Detect the language from user interest and conversation
- Use the SAME language for your question
- Keep tone professional yet friendly

OUTPUT FORMAT - You must return ONLY valid JSON with this exact structure:
- shouldContinue: boolean (true or false)
- question: string (your next question if shouldContinue is true, empty string if false)
- reason: string (one of: sufficient_info, need_clarification, max_reached, need_more_context)
- confidence: number (between 0.0 and 1.0)
- analysis: object with four number properties (completeness, clarity, depth, actionability, each between 0.0 and 1.0)

IMPORTANT:
- If shouldContinue is true, provide a thoughtful unique question that fills the biggest gap
- If shouldContinue is false, question must be empty string
- Be honest in your assessment - do not artificially inflate scores
- Consider the QUALITY of answers not just quantity
- Return ONLY valid JSON, no markdown, no extra text
"""

    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user", 
                    "content": prompt
                }
            ],
            model=model_llm,
            temperature=0.7,
            response_format={"type": "json_object"},
        )
        
        text = chat_completion.choices[0].message.content
        cleaned_text = text.replace("```json", "").replace("```", "").strip()
        data = json.loads(cleaned_text)
        print(data)
        
        # Validate response structure
        required_keys = ["shouldContinue", "question", "reason", "confidence", "analysis"]
        if not all(key in data for key in required_keys):
            raise ValueError(f"Missing required keys in AI response. Got: {data.keys()}")
        
        # Ensure proper types
        data["shouldContinue"] = bool(data["shouldContinue"])
        data["confidence"] = float(data["confidence"])
        
        return data

    except Exception as e:
        print(f"Error in continue-interview API: {e}")
        raise HTTPException(status_code=500, detail=str(e))

