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
    const { fullContext, selectedText, section, requestType, language } =
      await req.json();

    // Buat 'prompt' secara dinamis di backend
    let finalPrompt = "";
    switch (requestType) {
      case "GENERATE_AC":
        finalPrompt = `You are an expert QA Engineer. Based on the following User Story, generate detailed Acceptance Criteria. The User Story is: "${selectedText}". The full project context is: ---${fullContext}---. Answer in ${language}.`;
        break;
      case "ELABORATE_TECHNICAL":
        finalPrompt = `You are a Senior Software Architect. Elaborate on the following technical point with more detail, suggesting potential implementations or challenges. The point is: "${selectedText}". The full project context is: ---${fullContext}---. Answer in ${language}.`;
        break;
      case "COMPARE_ALTERNATIVES":
        finalPrompt = `You are a Principal Engineer. The user has selected a technology: "${selectedText}". Compare this with 2-3 popular alternatives, providing pros and cons for each in the context of this project: ---${fullContext}---. Answer in ${language}.`;
        break;
      // Tambahkan case lain di sini
      default:
        finalPrompt = `You are Architech, a world-class CTO. A user has selected the text "${selectedText}". Please elaborate, expand, or improve upon it within the full context of their document: ---${fullContext}---. Always answer in ${language}.`;
    }

    const { text } = await generateText({
      model: google("models/gemini-1.5-flash-latest"),
      prompt: finalPrompt,
    });

    // Kirim kembali sebagai aiResponse agar konsisten dengan frontend
    return NextResponse.json({ aiResponse: text });
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
