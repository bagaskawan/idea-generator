// src/app/api/regenerate-section/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { selectedText, fullContext } = body; // Ambil teks yang diseleksi dan konteks dokumennya

    if (!selectedText) {
      return NextResponse.json({ error: "No text selected." }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
    });

    const prompt = `You are 'Architech', an expert CTO. A user has selected a section of their project blueprint and wants you to refine or expand it.

    Full Blueprint Context:
    ---
    ${fullContext}
    ---

    Selected section to regenerate:
    ---
    ${selectedText}
    ---

    Your task is to rewrite ONLY the selected section with more detail, clarity, or a fresh perspective. Maintain the original markdown formatting. Output only the new, regenerated text for that section.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const regeneratedText = response.text();

    return NextResponse.json({ regeneratedText });
  } catch (error) {
    console.error("Error regenerating section:", error);
    return NextResponse.json(
      { error: "Failed to regenerate section" },
      { status: 500 }
    );
  }
}
