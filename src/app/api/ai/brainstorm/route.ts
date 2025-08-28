// src/app/api/ai/brainstorm/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

// Objek untuk menyimpan instruksi spesifik untuk setiap jenis permintaan
const requestPrompts = {
  GENERATE_AC:
    "Buatkan beberapa 'Acceptance Criteria' dalam bentuk bullet points untuk user story ini.",
  IDENTIFY_EDGE_CASES:
    "Identifikasi potensi 'edge cases' dan skenario negatif dalam bentuk bullet points untuk konteks ini.",
  COMPARE_ALTERNATIVES:
    "Bandingkan teknologi atau pendekatan ini dengan 1-2 alternatif populer. Jelaskan trade-off (kelebihan & kekurangan) dalam konteks proyek ini.",
  ELABORATE_TECHNICAL:
    "Jelaskan kebutuhan teknis atau langkah-langkah implementasi awal untuk fitur ini dalam bentuk checklist atau numbered list.",
  // Tambahkan jenis permintaan lain di sini di masa depan
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullContext, selectedText, section, requestType } = body;

    if (!fullContext || !selectedText || !section || !requestType) {
      return NextResponse.json(
        { error: "Missing required parameters." },
        { status: 400 }
      );
    }

    // Validasi apakah requestType ada di dalam objek requestPrompts
    if (!(requestType in requestPrompts)) {
      return NextResponse.json(
        { error: "Invalid request type." },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
    });

    // Ini adalah "Meta-Prompt Persona" yang kita diskusikan
    const instruction = `
      You are 'Architech', a world-class CTO and software architect with decades of experience. 
      You are mentoring a developer. Your tone is encouraging, pragmatic, and insightful. 
      You don't just give answers; you guide them by revealing technical details, potential risks, and trade-offs. 
      Always respond in Bahasa Indonesia with clear markdown formatting.

      CONTEXT:
      The user is working on a project blueprint. Here is the entire document for your reference:
      ---
      ${fullContext}
      ---

      TASK:
      The user is currently in the "${section}" section of their document. 
      They have highlighted the following text: "${selectedText}".
      
      Their specific request is: "${
        requestPrompts[requestType as keyof typeof requestPrompts]
      }"

      Please generate a concise and actionable response that directly fulfills this request. 
      The response should be formatted to be inserted directly back into their document.
    `;

    const result = await model.generateContent(instruction);
    const response = await result.response;
    const aiResponse = response.text();

    return NextResponse.json({ aiResponse });
  } catch (error) {
    console.error("Error in AI Brainstorm API:", error);
    return NextResponse.json(
      { error: "Failed to get response from AI." },
      { status: 500 }
    );
  }
}
