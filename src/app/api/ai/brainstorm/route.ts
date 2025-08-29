// src/app/api/ai/route.ts
// src/app/api/ai/route.ts
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai"; // Import dari @ai-sdk/core atau ai
import { NextResponse } from "next/server";
import { toast } from "sonner";

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log(apiKey);
  toast.info("Klik");
  return null;

  if (!apiKey) {
    const errorMessage =
      "Missing GEMINI_API_KEY environment variable. Please set it up in your .env.local file.";
    console.error(errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }

  const google = createGoogleGenerativeAI({
    apiKey,
  });

  try {
    const { prompt, selectedText, language } = await req.json(); // Parse body dari client

    const { text } = await generateText({
      model: google("models/gemini-1.5-flash-latest"),
      prompt: `You are Architech, a world-class CTO. Always answer in ${language}.  
Selected text: "${selectedText}".  
Request: ${prompt}.`, // Custom prompt Anda
    });

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("AI generation error:", error);
    return NextResponse.json(
      {
        error: `Oops! Something went wrong: ${
          error.message || "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}
