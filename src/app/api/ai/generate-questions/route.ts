// src/app/api/ai/generate-questions/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { interest } = body;

    if (!interest) {
      return NextResponse.json(
        { error: "Field of interest is required." },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
    });

    // Prompt ini khusus untuk menghasilkan pertanyaan
    const prompt = `
      You are a sharp and insightful project consultant. Based on the user's initial interest: "${interest}", your task is to generate exactly 3 thought-provoking follow-up questions to better understand their vision.

      These questions should help clarify:
      1.  The target audience or user.
      2.  A key feature or technology.
      3.  The main goal or success metric.

      The entire output MUST be a single, valid JSON object with ONE key: "questions".
      The value for "questions" must be an array of 3 strings.

      language is adjusted to the use of the [majority] language inputted by the user

      Example for interest "IoT for agriculture":
      {
        "questions": [
          "Are we targeting small-scale local farmers or large agribusiness corporations?",
          "Which specific technology excites you more: drone-based crop monitoring or soil sensor networks?",
          "What is the most critical outcome: water efficiency, pest reduction, or harvest prediction?"
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    text = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    const generatedQuestions = JSON.parse(text);

    return NextResponse.json(generatedQuestions);
  } catch (error) {
    console.error("Error generating questions from Gemini:", error);
    return NextResponse.json(
      { error: "Failed to generate follow-up questions" },
      { status: 500 }
    );
  }
}
