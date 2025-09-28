// src/app/api/ai/generate-idea/route.ts

import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// PERBAIKAN: Gunakan kunci API sisi server yang lebih aman
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      interest,
      projectName,
      projectDescription,
      mvpFeatures,
      uniqueSellingProposition,
      conversation,
    } = body;

    if (!interest || !conversation) {
      return NextResponse.json(
        { error: "Interest and conversation context are required." },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    // --- PROMPT BARU YANG DIOPTIMALKAN UNTUK STRUKTUR DATABASE BARU ---
    const prompt = `
      You are "Architech", a world-class CTO and Digital Product Architect.
      Your mission is to expand a chosen project idea into a complete, professional, and actionable project blueprint. You will be given the entire context of the user's journey, from initial interest to the final selected idea.

      ---
      ## User's Journey Context
      1.  **Initial Interest:** "${interest}"
      2.  **Clarification Interview:** ${JSON.stringify(conversation, null, 2)}

      ---
      ## Selected Project Idea to Elaborate
      You MUST build the entire blueprint based on the following chosen idea:
      - **Project Name:** "${projectName}"
      - **Unique Selling Proposition:** "${uniqueSellingProposition}"
      - **Core MVP Features:** ${JSON.stringify(mvpFeatures, null, 2)}
      ---

      🔹 **OUTPUT REQUIREMENTS**

      Your output MUST be a single, valid JSON object with two top-level keys: \`projectData\` and \`workbenchContent\`.

      1.  **projectData**: A structured metadata summary. It MUST include:
          * **title**: (string) Use the exact Project Name from the user's selection: "${projectName}".
          * **problem_statement**: (string) A concise paragraph explaining the core problem, derived from the conversation and selected idea.
          * **target_audience**: (array of objects) Each with "icon" and "text" fields. Generate 2-3 specific audiences. Example: [{"icon": "student", "text": "High school students preparing for exams"}].
          * **success_metrics**: (array of objects) Each with "type" ("Kuantitatif" or "Kualitatif") and "text". Generate 2-3 key metrics. Example: [{"type": "Kuantitatif", "text": "Achieve 1,000 monthly active users within 6 months"}].
          * **tech_stack**: (array of strings) A relevant list of technologies. Example: ["Next.js", "TypeScript", "Supabase", "Vercel"].

      2.  **workbenchContent**: A detailed narrative blueprint as a single Markdown string. The language used MUST match the user's input language.
          * **### User Stories**: Expand on the "Core MVP Features". Write 5-7 detailed user stories from different perspectives (e.g., "As a new user...", "As an administrator...").
          * **### System Architecture**: Describe a clear architecture (Frontend, Backend, Database, Auth, Deployment). Explain how the tech stack choices support the project's goals.
          * **### API Endpoints**: List key API endpoints with HTTP Method, Path, Description, and a summary of the expected request/response. This should directly relate to implementing the user stories.
          * **### Roadmap**: Create a phased roadmap (e.g., MVP, Phase 2, Future). Each phase must have clear milestones and outcomes, starting with the "Core MVP Features".
          * **### Task Breakdown**: Break down the MVP phase into actionable tasks categorized by Frontend, Backend, Database, and DevOps/Testing. Create 5-10 specific tasks per category.

      🔹 **IMPORTANT RULES**
      - The entire output MUST be a perfectly valid, parsable JSON.
      - The value for "workbenchContent" must be a single string containing formatted markdown.
      - The blueprint must be a direct, logical, and detailed expansion of the **Selected Project Idea** provided above.
    `;
    // --- AKHIR DARI PROMPT BARU ---

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const rawText = response.text();

    // -- BLOK DEBUGGING & PENGAMANAN --
    console.log("Raw AI Response (Generate):", rawText);

    let generatedBlueprint;
    try {
      const cleanedText = rawText
        .replace(/^```json\s*/, "")
        .replace(/```\s*$/, "")
        .trim();
      generatedBlueprint = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("JSON Parsing Error (Generate):", parseError);
      return NextResponse.json(
        { error: "AI returned an invalid format.", rawResponse: rawText },
        { status: 500 }
      );
    }
    // -- AKHIR BLOK DEBUGGING --

    return NextResponse.json(generatedBlueprint);
  } catch (error) {
    console.error("Error generating idea from Gemini:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "Failed to generate idea", details: errorMessage },
      { status: 500 }
    );
  }
}
