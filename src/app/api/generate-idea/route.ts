// src/app/api/generate-idea/route.ts

import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { interest, conversation } = body;

    if (!interest || !conversation) {
      return NextResponse.json(
        { error: "Interest and conversation context are required." },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
    });

    // --- PROMPT FINAL DENGAN INSTRUKSI PALING JELAS ---
    const prompt = `
    You are 'Architech', a highly experienced Chief Technology Officer. Your task is to generate ONE complete project idea blueprint.

    Use the following context from your interview with the user:
    - Initial Interest: "${interest}"
    - Conversation Q&A: ${JSON.stringify(conversation, null, 2)}

    The entire output MUST be a single, valid JSON object with two keys: "name" and "description".
      - "name": A creative and professional title for the project.
      - "description": A string containing a detailed plan in English, formatted using this EXACT markdown structure:

    ## **1. Main Application Goal**
    [A concise, single paragraph explaining the core purpose and the problem this application solves.]

    ## **2. How It Works (User Flow)**
    [A step-by-step user flow. MUST use a Markdown numbered list (e.g., '1. **Step Name:** Details...').]

    ## **3. MVP Features**
    [List 3-4 core MVP features. For EACH feature, you MUST use the exact format: '- **Feature Name:** (Brief function). (Detailed explanation.)']

    ## **4. Recommended Tech Stack**
    [List the tech stack. For EACH item, you MUST use the exact format: '- **Category:** Technology Name - (Brief, relevant reason.)'. For example: '- **Frontend:** React with TypeScript - (Modern and performant for interactive UIs.)']
    `;
    // --- AKHIR DARI PROMPT FINAL ---

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    text = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    const generatedIdea = JSON.parse(text);

    return NextResponse.json(generatedIdea);
  } catch (error) {
    console.error("Error generating idea from Gemini:", error);
    return NextResponse.json(
      { error: "Failed to generate idea" },
      { status: 500 }
    );
  }
}
