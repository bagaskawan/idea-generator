// src/app/api/ai/generate-idea/route.ts

import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// PERBAIKAN: Gunakan kunci API sisi server yang lebih aman
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

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

    // --- PROMPT BARU YANG DIOPTIMALKAN UNTUK STRUKTUR DATABASE BARU ---
    const prompt = `
      You are "Architech", a world-class CTO and Digital Product Architect.
      Your mission is to generate a complete, professional project blueprint based on a user interview.

      Interview Context:

      Initial Interest: "${interest}"

      Conversation Q&A: ${JSON.stringify(conversation, null, 2)}

      🔹 Output Requirements

      Your output MUST be a single, valid JSON object with two top-level keys:

      projectData

      workbenchContent

      1. projectData

      This section is a structured metadata summary of the project. It MUST include:

      title: (string) A short, modern, and professional project title. Use 1–2 words only. 
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

    problem_statement: (string) A concise, single paragraph explaining the core problem this application solves.

      target_audience: (array of objects) Each object has "icon" and "text" fields.
      Example: [{"icon": "users", "text": "Fitness enthusiasts of all levels"}].
      → Generate 2–3 audiences.

      success_metrics: (array of objects) Each object has "type" ("Kuantitatif" or "Kualitatif") and "text".
      Example: [{"type": "Kuantitatif", "text": "Achieve 1000 monthly active users within 6 months"}].
      → Generate 2–3 metrics.

      tech_stack: (array of strings) A simple list of relevant technologies.
      Example: ["React", "TypeScript", "Node.js", "PostgreSQL", "Vercel"].

      2. workbenchContent

      This section is a detailed narrative blueprint.
      👉 All content MUST be written in the same language as ${interest} (if the user’s input is in English → output English, if Indonesian → output Indonesian).

      ## User Stories
      Write multiple user stories from different perspectives (end-users, admins, stakeholders). Each story should follow the As a [role], I want [feature], so that [benefit] format. Ensure 5–7 meaningful stories are provided.

      ## System Architecture
      Provide a clear description of the proposed architecture, including frontend, backend, database, infrastructure, and third-party services. Mention possible integrations, scalability approach, and security considerations. This should feel like a CTO-level overview.

      ## API Endpoints
      List the key API endpoints in a structured format. For each endpoint, include:

      HTTP Method (GET, POST, PUT, DELETE)

      Path (e.g., /api/users)

      Brief description of what it does

      Expected request and response structure (summary, not full schema)

      ## Roadmap
      Provide a phased roadmap (e.g., MVP, Phase 2, Phase 3). Each phase should include milestones, expected outcomes, and value delivered to users. Minimum of 3 phases.

      ## Task Breakdown
      Break down the project into actionable tasks. Categorize into Frontend, Backend, Database, Infrastructure/DevOps, and QA/Testing. Each category should list 5–10 concrete tasks. This breakdown should feel like a realistic task list for a dev team.

      🔹 Important Notes

      All narrative text in workbenchContent MUST follow the same language as ${interest}.

      Ensure the JSON is perfectly valid (parsable).

      Avoid extra commentary, explanations, or markdown outside the JSON structure.
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
