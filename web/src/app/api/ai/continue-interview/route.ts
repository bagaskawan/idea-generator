// src/app/api/ai/continue-interview/route.ts

import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Gunakan kunci API sisi server yang lebih aman
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: Request) {
  try {
    const { interest, history } = await request.json();

    if (!interest || !history) {
      return NextResponse.json(
        { error: "Interest and history are required." },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt = `
      You are a friendly and insightful project consultant for software developers, conducting an interview.
      The user's initial interest is: "${interest}".
      The conversation history so far is: ${JSON.stringify(history)}.

      Your role is to carefully analyze the entire conversation history and ask the next most logical follow-up question that drives clarity and progress.

      Instructions:

      Language Match: Always ask the question in the same language as the user's interest and prior conversation.

      Uniqueness: Do not repeat or rephrase any previous questions. Ensure each new question adds fresh value.

      Clarity: The question must be concise, precise, and thought-provoking.

      Format: Output MUST be a single, valid JSON object with one key only: "question". No explanations, no markdown, no additional keys.

      Impact: The follow-up should encourage the user to refine their vision, uncover priorities, or make a meaningful decision.

      Example 1 (User input in Indonesian):

      User Interest: "Platform pembelajaran online untuk siswa SMA"

      Output: { "question": "Fokus utama apa yang ingin Anda capai terlebih dahulu dengan platform ini?" }

      Example 2 (User input in English):

      User Interest: "An AI-powered nutrition tracker"

      Output: { "question": "Which specific problem do you want this nutrition tracker to solve first?" }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const rawText = response.text();

    // -- BLOK DEBUGGING & PENGAMANAN --
    console.log("Raw AI Response (Continue):", rawText); // Log di terminal Next.js

    let data;
    try {
      const cleanedText = rawText
        .replace(/^```json\s*/, "")
        .replace(/```\s*$/, "")
        .trim();
      data = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("JSON Parsing Error (Continue):", parseError);
      return NextResponse.json(
        { error: "AI returned an invalid format.", rawResponse: rawText },
        { status: 500 }
      );
    }
    // -- AKHIR BLOK DEBUGGING --

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in continue-interview API:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "Failed to continue interview", details: errorMessage },
      { status: 500 }
    );
  }
}
