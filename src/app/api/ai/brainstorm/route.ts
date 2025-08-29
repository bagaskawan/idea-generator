// src/app/api/ai/route.ts
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai"; // Import dari @ai-sdk/core atau ai
import { NextResponse } from "next/server";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY, // Gunakan env server-side (non-public!)
});

export async function POST(req: Request) {
  try {
    const { prompt, selectedText, language } = await req.json(); // Parse body dari client

    const { text } = await generateText({
      model: google("models/gemini-1.5-flash-latest"),
      prompt: `You are Architech, a world-class CTO. Always answer in ${language}.  
Selected text: "${selectedText}".  
Request: ${prompt}.`, // Custom prompt Anda
    });

    return NextResponse.json({ text });
  } catch (error) {
    console.error("AI generation error:", error);
    return NextResponse.json(
      { error: "Oops! Something went wrong." },
      { status: 500 }
    );
  }
}
