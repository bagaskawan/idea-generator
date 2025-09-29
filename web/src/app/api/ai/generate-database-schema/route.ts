import createClient from "@/lib/db/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: Request) {
  const supabase = await createClient();
  try {
    const { projectId, projectDescription, userStories, apiEndpoints } =
      await request.json();

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required." },
        { status: 400 }
      );
    }

    if (!userStories || !apiEndpoints) {
      return NextResponse.json(
        { error: "Project context is required." },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      You are "Schema-DB", a professional Database Architect. Your mission is to design a clear, normalized, and efficient relational database schema based on a project's description, user stories, and API endpoints.

      ---
      ## Project Context
      - **Description:** ${projectDescription}
      - **User Stories:** ${userStories}
      - **API Endpoints:** ${apiEndpoints}
      ---

      🔹 **TASK**
      1.  Analyze the provided context to identify the core entities (e.g., users, posts, comments, products).
      2.  For each entity, define the necessary columns with appropriate data types (use standard SQL types like UUID, TEXT, VARCHAR, INTEGER, BOOLEAN, TIMESTAMPZ).
      3.  Identify primary keys, foreign keys, and unique constraints to establish relationships between tables.
      4.  The 'users' table is mandatory and should be the central point for user-related data.

      🔹 **OUTPUT REQUIREMENTS**
      - Your output MUST be a single, valid JSON object.
      - The JSON object must have a single top-level key: "schema".
      - The value of "schema" must be an array of table objects.
      - Each table object must have:
          - "table_name": (string) The name of the table (e.g., "users").
          - "columns": (array of objects) A list of columns.
      - Each column object must have:
          - "name": (string) The column name (e.g., "id", "user_id").
          - "type": (string) The SQL data type (e.g., "UUID", "TEXT").
          - "is_primary_key": (boolean, optional) True if it's the primary key.
          - "is_foreign_key": (boolean, optional) True if it's a foreign key.
          - "references": (string, optional) The table and column it references (e.g., "users(id)").

      Example of a perfect output structure:
      {
        "schema": [
          {
            "table_name": "users",
            "columns": [
              { "name": "id", "type": "UUID", "is_primary_key": true },
              { "name": "email", "type": "TEXT" },
              { "name": "created_at", "type": "TIMESTAMPZ" }
            ]
          },
          {
            "table_name": "posts",
            "columns": [
              { "name": "id", "type": "UUID", "is_primary_key": true },
              { "name": "content", "type": "TEXT" },
              { "name": "user_id", "type": "UUID", "is_foreign_key": true, "references": "users(id)" }
            ]
          }
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const rawText = response.text();
    const cleanedText = rawText
      .replace(/^```json\s*/, "")
      .replace(/```\s*$/, "")
      .trim();
    const generatedSchema = JSON.parse(cleanedText);

    // --- LOGIKA BARU: SIMPAN KE SUPABASE ---
    const { error } = await supabase.from("database_schemas").upsert(
      {
        project_id: projectId,
        schema_data: generatedSchema, // Simpan seluruh objek JSON
        updated_at: new Date().toISOString(),
      },
      { onConflict: "project_id" }
    ); // 'upsert' akan create jika belum ada, atau update jika sudah ada

    if (error) {
      console.error("Error saving schema to DB:", error);
      // Tetap kembalikan hasil ke user, tapi beri catatan error di server
    }

    return NextResponse.json(generatedSchema);
  } catch (error) {
    console.error("Error generating database schema:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "Failed to generate schema", details: errorMessage },
      { status: 500 }
    );
  }
}
