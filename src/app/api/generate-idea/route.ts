import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Inisialisasi Gemini client dengan API Key dari environment variables
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

    // --- PROMPT YANG DIPERBARUI DENGAN INSTRUKSI LEBIH DETAIL ---
    const prompt = `
    You are 'Architech', a highly experienced Chief Technology Officer and Digital Product Architect.
    Your task is to generate ONE complete project idea blueprint based on a user's field of interest and a follow-up Q&A session.

    Use the following context:
    - Initial Interest: "${interest}"
    - Conversation Q&A: ${JSON.stringify(conversation, null, 2)}

    The project idea must be unique, modern, and impressive for a developer's portfolio.
    The entire output MUST be a single, valid JSON object with two keys: "name" and "description".
      - The "name" key should contain a creative and professional title for the project.
      - The "description" key's value MUST be a string containing a detailed plan in English, formatted using the following exact markdown structure:

    ## **1. Main Application Goal**
    [Provide a concise, single paragraph explaining the core purpose and the problem this application solves.]

    ## **2. How It Works (User Flow)**
    [Provide a step-by-step user flow. You MUST use a Markdown numbered list (e.g., '1. ...', '2. ...'). Be specific.]

    ## **3. MVP Features (Minimum Viable Product)**
    [List 3-4 core MVP features. For each feature, you MUST use the exact format: '- **Feature Name:** (Brief function). (Detailed explanation of what it does and why it's important.)']

    ## **4. Recommended Tech Stack**
    [List the recommended tech stack with a brief, relevant reason for each. For each item, you MUST use the exact format: '- **Category:** [Technology Name] - [Brief reason why it's a good choice.]'. For example: '- **Frontend:** [Next.js + TypeScript] - [Provides a modern, fast, and type-safe development experience.]']
    `;
    // --- AKHIR DARI PROMPT YANG DIPERBARUI ---

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Membersihkan dan mem-parsing output JSON dari model
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
