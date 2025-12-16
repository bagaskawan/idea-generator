import { createGroq } from "@ai-sdk/groq";
import { convertToModelMessages, streamText } from "ai";
import {
  aiDocumentFormats,
  injectDocumentStateMessages,
  toolDefinitionsToToolSet,
} from "@blocknote/xl-ai/server";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Create Groq client with API key from environment
const groq = createGroq({
  apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY || process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { messages, toolDefinitions } = await req.json();

    // Use Groq's Llama model for the AI operations
    const result = streamText({
      model: groq("llama-3.3-70b-versatile"),
      system: `${aiDocumentFormats.html.systemPrompt}

CRITICAL RULES:
1. ALWAYS preserve the original language of the text. If the text is in Indonesian, respond in Indonesian. If in English, respond in English.
2. Do NOT translate text to another language unless explicitly asked.
3. Focus only on the requested modification (simplify, make informal, etc.) while keeping the same language.
4. Maintain the tone and style appropriate for the language used.`,
      messages: convertToModelMessages(injectDocumentStateMessages(messages)),
      tools: toolDefinitionsToToolSet(toolDefinitions),
      toolChoice: "required",
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("[BlockNote AI] Error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process AI request" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
