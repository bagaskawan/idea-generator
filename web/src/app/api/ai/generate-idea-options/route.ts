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
      model: "gemini-2.5-flash",
    });

    const prompt = `
      You are an expert Creative Project Architect. Your task is to generate 3 distinct and creative project ideas based on the user's interest and our brief conversation.

      **User Input:**
      - Interest: "${interest}"
      - Conversation: ${JSON.stringify(conversation, null, 2)}

      **Output Requirements:**
      Return a single, valid JSON object with a key "ideas". This key must contain an array of exactly 3 project idea objects. Each object MUST conform to this schema:
      - "projectName": (string) A short, modern, and professional project title. Use 1–2 words only. I recommended for 1 word only. 
        for example:
          Nuansa Modern & Futuristik
          - Orbit → simple, mengesankan ekosistem yang terus bergerak.
          - Neura → terinspirasi dari neural/AI, cocok untuk produk pintar.
          - Verta → dari kata vertical, kesan solid & scalable.
          - Zyra → nuansa futuristik, pendek, dan mudah diingat.
          - Quantis → kesan analitik, data, dan presisi.
          Nuansa Produktivitas & Solusi
          - Strive → melambangkan perjuangan menuju hasil.
          - Focusly → pas untuk aplikasi produktivitas/goal tracking.
          - Tracko → cocok untuk aplikasi monitoring atau tracker.
          - Planova → dari plan + nova, rencana baru yang bersinar.
          - Clario → kesan jernih & terarah, pas untuk app manajemen.
          Nuansa Lifestyle & Engagement
          - Glow → simpel, memberi kesan positif & hidup.
          - Pulsefy → cocok untuk sesuatu yang real-time & engaging.
          - Mozaic → menggambarkan keberagaman yang menyatu.
          - Lifted → memberi nuansa naik level, berkembang.
          - Habitu → bagus untuk aplikasi habit-tracking atau wellness.
        - "uniqueSellingProposition": (string) A single, powerful sentence explaining what makes this idea unique.
        - "projectDescription": (string) A concise, one-paragraph description of the project.
        - "mvpFeatures": (array of strings) A list of 3-4 essential features for the Minimum Viable Product (MVP).
        - "icon": (string) Pick ONE appropriate icon name from this list that best represents the idea: "zap", "lightbulb", "rocket", "target", "gem", "heart". <= all is just example for your creativity idea project name.

      **Language Match:** The entire JSON output's string values MUST be in the same language as the user's interest ("${JSON.stringify(
        conversation,
        null,
        2
      )}").
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
