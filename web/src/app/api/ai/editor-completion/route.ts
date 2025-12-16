import { createGroq } from "@ai-sdk/groq";
import { generateText } from "ai";

// Create Groq client with API key from environment
const groq = createGroq({
  apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY || process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { context, prompt } = await req.json();

    if (!context || !context.trim()) {
      return new Response(JSON.stringify({ error: "Context is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Build the prompt for continuation
    const systemPrompt = `You are a helpful writing assistant. Your task is to continue the user's text naturally and coherently.

CRITICAL RULES:
1. ALWAYS write in the SAME LANGUAGE as the provided context. If the context is in Indonesian, respond in Indonesian. If in English, respond in English.
2. Do NOT translate or switch languages.
3. Continue the thought naturally, maintaining the same tone and style.
4. Keep your continuation concise but meaningful (1-3 sentences).
5. Do not repeat what was already written.`;

    const userPrompt = prompt
      ? `Context:\n${context}\n\nContinue this text based on the context above:\n${prompt}`
      : `Continue this text naturally:\n${context}`;

    const result = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.7,
    });

    return new Response(
      JSON.stringify({
        completion: result.text,
        success: true,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[Editor Completion] Error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to generate completion",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
