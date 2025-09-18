import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is not set.");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req: Request) {
  try {
    const { interest, conversation } = await req.json();

    if (!interest || !conversation) {
      return NextResponse.json(
        { error: "Interest and conversation history are required." },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
    });

    const prompt = `
      Based on the user's initial interest "${interest}" and this interview history:
      ---
      ${JSON.stringify(conversation, null, 2)}
      ---
      Your task is to act as a creative project architect. Generate 3 distinct and creative project ideas.
      Return the ideas as a JSON object with an "ideas" key containing an array that conforms to the provided schema.
      Language Match: Always ask the question in the same language as the user's interest and prior conversation.
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
      console.error("JSON Parsing Error (Generate Idea Options):", parseError);
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
