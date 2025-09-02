// src/app/api/ai/brainstorm/route.ts

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  console.log("--- New Request to /api/ai/brainstorm ---");
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    const errorMessage = "Missing GEMINI_API_KEY environment variable.";
    console.error(errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }

  const google = createGoogleGenerativeAI({
    apiKey,
  });

  try {
    const { prompt, selectedText, language } = await req.json();
    console.log("Received data:", { prompt, selectedText, language });

    const { text } = await generateText({
      model: google("models/gemini-1.5-flash-latest"),
      prompt: `You are Architech, a world-class CTO. Always answer in ${language}.
Selected text: "${selectedText}".
Request: ${prompt}.`,
    });

    console.log("Generated text from AI:", text);
    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("AI generation error on server:", error);
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
