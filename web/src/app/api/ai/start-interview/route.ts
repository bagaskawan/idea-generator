// src/app/api/ai/start-interview/route.ts

import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Gunakan kunci API sisi server yang lebih aman
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { interest } = body;

    if (!interest) {
      return NextResponse.json(
        { error: "Interest is required." },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt = `
      You are a friendly, highly experienced project consultant for software developer conducting a short but impactful interview.
      The user's initial interest is: "${interest}".

      Your mission is to unlock their vision by asking one single, most valuable follow-up question that helps clarify their core idea.

      Instructions:

      Language Match: Carefully analyze the language of the user's interest ("${interest}") and write your question in that exact same language.

      Tone: Keep your tone professional yet approachable, encouraging the user to think deeper. Avoid rigid formalities such as "Bapak/Ibu" or "Sir/Madam".

      Format: Your output MUST be a single, valid JSON object with only one key: "question". No extra commentary, no markdown, no additional fields.

      Impact: The question should spark clarity, highlight priorities, and guide the user to define the essence of their idea.

      Example 1 (User input in Indonesian):

      User Interest: "Aplikasi kasir untuk warung kopi"

      Output: { "question": "Ide yang menarik! Menurut Anda, fitur apa yang paling penting untuk ada di versi pertama aplikasi ini?" }

      Example 2 (User input in English):

      User Interest: "A workout planner app"

      Output: { "question": "Sounds exciting! Who do you see as the main target users for this workout planner?" }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const rawText = response.text();

    // -- BLOK DEBUGGING & PENGAMANAN --
    // console.log("Raw AI Response:", rawText);

    let data;
    try {
      // Coba bersihkan dan parse JSON
      const cleanedText = rawText
        .replace(/^```json\s*/, "")
        .replace(/```\s*$/, "")
        .trim();
      data = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("JSON Parsing Error:", parseError);
      // Jika gagal, log output mentah dan kirim error yang jelas
      return NextResponse.json(
        { error: "AI returned an invalid format.", rawResponse: rawText },
        { status: 500 }
      );
    }
    // -- AKHIR BLOK DEBUGGING --

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in start-interview API:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "Failed to start interview", details: errorMessage },
      { status: 500 }
    );
  }
}
