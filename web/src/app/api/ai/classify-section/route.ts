// src/app/api/ai/classify-section/route.ts

import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Definisikan kategori yang kita inginkan dalam bentuk enum atau tipe
type SectionCategory =
  | "USER_STORIES"
  | "TECH_STACK"
  | "DATA_MODEL"
  | "ROADMAP"
  | "UNKNOWN";

export async function POST(request: Request) {
  try {
    const { headingText } = await request.json();

    if (!headingText) {
      return NextResponse.json(
        { error: "Heading text is required." },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt = `
      You are an expert text classifier. Your task is to classify the following heading text into ONE of the following categories: 
      "USER_STORIES", "TECH_STACK", "DATA_MODEL", "ROADMAP", or "UNKNOWN".
      
      Do not provide any explanation, only return a single category name.

      Examples:
      - Text: "User Story", Result: "USER_STORIES"
      - Text: "Bagaimana cara kerja aplikasi ini", Result: "USER_STORIES"
      - Text: "Teknologi yang akan kita pakai", Result: "TECH_STACK"
      - Text: "Database Schema", Result: "DATA_MODEL"
      - Text: "Rencana Pengerjaan", Result: "ROADMAP"
      - Text: "Pendahuluan", Result: "UNKNOWN"

      Text to classify: "${headingText}"
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let category = response.text().trim() as SectionCategory;

    // Fallback jika AI memberikan jawaban yang tidak terduga
    const validCategories: SectionCategory[] = [
      "USER_STORIES",
      "TECH_STACK",
      "DATA_MODEL",
      "ROADMAP",
      "UNKNOWN",
    ];
    if (!validCategories.includes(category)) {
      category = "UNKNOWN";
    }

    return NextResponse.json({ category });
  } catch (error) {
    console.error("Error classifying section:", error);
    return NextResponse.json({ category: "UNKNOWN" }, { status: 500 });
  }
}
