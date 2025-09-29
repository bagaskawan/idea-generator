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
      reasonProjectName,
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
      3.  **Project Description:** "${projectDescription}"

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
          * **title_reason**: (string) Use the exact Title Reason from the user's selection: "${reasonProjectName}".
          * **problem_statement**: (string) A concise paragraph explaining the core problem, derived from the conversation and selected idea. You can explain and elaboration from "${projectDescription}".
          * **target_audience**: (array of objects) Each with "icon" and "text" fields. Generate 2-3 specific audiences. Example: [{"icon": "student", "text": "High school students preparing for exams"}].
          * **success_metrics**: (array of objects) Each with "type" ("Kuantitatif" or "Kualitatif") and "text". Generate 2-3 key metrics. Example: [{"type": "Kuantitatif", "text": "Achieve 1,000 monthly active users within 6 months"}].
          * **tech_stack**: (array of strings) A relevant list of technologies. Example: ["Next.js", "TypeScript", "Supabase", "Vercel"].

      2.  **workbenchContent**: A detailed narrative blueprint as a single Markdown string. The language used MUST match the user's input language.
           * **### Fitur Utama (Core Features)**
              Start by listing the core features based on the "Core MVP Features" provided. Present this as a clear, high-level overview of what the application does.

          * **### Roadmap**
              Create a phased roadmap (e.g., MVP, Phase 2, Future). The MVP phase must include the core features. Each phase should have clear milestones and outcomes.

          * **### Task Breakdown**
              Break down the MVP phase into actionable tasks categorized by Frontend, Backend, Database, and DevOps/Testing. Create 5-10 specific tasks per category in a checklist format.

          * **### User Stories**
              Write 5-7 detailed user stories based on the Core MVP Features. Use the format: "As a [role], I want [feature], so that [benefit]".

          * **### System Architecture**
              Describe a clear architecture (Frontend, Backend, Database, Auth, Deployment). Explain how the tech stack choices support the project's goals, and mention scalability and security considerations.

          * **### API Endpoints**
              List key API endpoints with HTTP Method, Path, a brief description, and a summary of the request/response structure.

          * **### Strategi Monetisasi (Monetization Strategy)**
              Suggest 2-3 potential ways this project could generate revenue (e.g., subscription, freemium, ads, one-time purchase). Briefly explain each strategy.

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
