import os
import json
# import google.generativeai as genai
from groq import Groq
from fastapi import APIRouter, HTTPException
from ..models import IdeaRequest, IdeaResponse, GenerateBlueprintRequest, BlueprintResponse, GenerateDatabaseSchemaRequest
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

router = APIRouter()


client = Groq(api_key=os.getenv("GROQ_API_KEY"))
model_llm = "openai/gpt-oss-120b"

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

def clean_json_string(text: str):
    return text.replace("```json", "").replace("```", "").strip()

@router.post("/generate-list")
async def generate_ideas_list(request: IdeaRequest):
    try:
        # Prompt Engineering
        prompt = f"""
        You are an expert Creative Project Architect. Your task is to generate 3 distinct and creative project ideas based on the user's interest and our brief conversation.
        
        CONTEXT:
        User Interest: {request.interest}
        Conversation History: {json.dumps(request.conversation, default=str)}

        INSTRUCTIONS:
        1. Generate exactly 3 unique project ideas.
        2. Each idea must be feasible for a mini-project but creative enough to stand out.
        3. Provide a clear title, a short catchy description, and a technical complexity rating (Low/Medium/High).
        
        OUTPUT FORMAT (JSON ARRAY):
        [
          {{
            "projectName": "Name of the project",
            "reasonProjectName": "One sentence on why this name fits",
            "projectDescription": "A comprehensive and detailed explanation (minimum 5 sentences) describing the core value, problem solution, and user impact.",
            "uniqueSellingProposition": "The key differentiator that makes this special.",
            "mvpFeatures": ["Feature 1", "Feature 2", "Feature 3"]
          }},
          ...
        ]
        """

        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "user", "content": prompt}
            ],
            model=model_llm,
            temperature=0.8,
            max_completion_tokens=4000,
            response_format={"type": "json_object"}
        )
        response_text = chat_completion.choices[0].message.content
        data = json.loads(response_text)
        
        if isinstance(data, list):
             return {"ideas": data}
             
        if isinstance(data, dict):
            if "ideas" in data:
                return data
            
            if "projectIdeas" in data:
                return {"ideas": data["projectIdeas"]}
                
            for key, value in data.items():
                if isinstance(value, list):
                    return {"ideas": value}

        print(f"Warning: AI Output format unexpected: {data}")
        return {"ideas": []}

    except Exception as e:
        print(f"Error in generate-list: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-blueprint")
async def generate_blueprint(request: GenerateBlueprintRequest):
    try:
        prompt = f"""
          You are "Architech", a world-class CTO and Digital Product Architect.
          Your mission is to expand a chosen project idea into a complete, professional, and actionable project blueprint.
          
          *** CRITICAL INSTRUCTION: ***
          - You MUST be EXTREMELY VERBOSE. Do not summarize. Do not be concise.
          - Every section must be expanded with multiple paragraphs, examples, and deep technical details.
          - If a section usually takes 1 sentence, write 5 sentences.

          ---
          ## User's Journey Context
          1.  **Initial Interest:** "{request.interest}"
          2.  **Clarification Interview:** {json.dumps(request.conversation, default=str)}
          3.  **Project Description:** "{request.projectDescription}"

          ---
          ## Selected Project Idea to Elaborate
          You MUST build the entire blueprint based on the following chosen idea:
          - **Project Name:** "{request.projectName}"
          - **Unique Selling Proposition:** "{request.uniqueSellingProposition}"
          - **Core MVP Features:** {json.dumps(request.mvpFeatures, default=str)}
          ---

          🔹 **OUTPUT REQUIREMENTS**

          Your output MUST be a single, valid JSON object with two top-level keys: `projectData` and `workbenchContent`.

          1.  **projectData**: A structured metadata summary. It MUST include:
              * **title**: (string) Use the exact Project Name from the user's selection: "{request.projectName}".
              * **title_reason**: (string) Use the exact Title Reason from the user's selection: "{request.reasonProjectName}".
              * **problem_statement**: (string) A concise paragraph explaining the core problem, derived from the conversation and selected idea. You can explain and elaboration from "{request.projectDescription}".
              * **target_audience**: (array of objects) Each with "icon" and "text" fields. Generate 2-3 specific audiences. Example: [{{"icon": "student", "text": "High school students preparing for exams"}}].
              * **success_metrics**: (array of objects) Each with "type" ("Kuantitatif" or "Kualitatif") and "text". Generate 2-3 key metrics. Example: [{{"type": "Kuantitatif", "text": "Achieve 1,000 monthly active users within 6 months"}}].
              * **tech_stack**: (array of strings) A relevant list of technologies. Example: ["Next.js", "TypeScript", "Supabase", "Vercel"].

          2.  **workbenchContent**: A detailed narrative blueprint as a single Markdown string. The language used MUST match the user's input language.
               * **### Fitur Utama (Core Features)**
                  Start by listing the core features based on the "Core MVP Features" provided. Present this as a clear, high-level overview of what the application does. For EACH feature, write a short paragraph explaining how it works technically and the benefit to the user.

              * **### Roadmap**
                  Create a phased roadmap (e.g., MVP, Phase 2, Future). The MVP phase must include the core features. Each phase should have clear milestones and outcomes.

              * **### Task Breakdown**
                  Break down the MVP phase into actionable tasks categorized by Frontend, Backend, Database, and DevOps/Testing. Create 10-15 specific tasks per category in a checklist format.

              * **### User Stories**
                  Write 7-10 detailed user stories based on the Core MVP Features. Use the format: "As a [role], I want [feature], so that [benefit]".

              * **### System Architecture**
                  Describe a clear architecture (Frontend, Backend, Database, Auth, Deployment). Explain how the tech stack choices support the project's goals, and mention scalability and security considerations.

              * **### API Endpoints**
                  - List at least 5 key endpoints.
                  - Include Method, Path, and a sample Request Body for each.

              * **### Strategi Monetisasi (Monetization Strategy)**
                  Suggest 2-3 potential ways this project could generate revenue (e.g., subscription, freemium, ads, one-time purchase). Briefly explain each strategy.

          🔹 **IMPORTANT RULES**
          - The entire output MUST be a perfectly valid, parsable JSON.
          - The value for "workbenchContent" must be a single string containing formatted markdown.
          - The blueprint must be a direct, logical, and detailed expansion of the **Selected Project Idea** provided above.
        """

        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "user", "content": prompt}
            ],
            model=model_llm,
            temperature=0.8,
            max_completion_tokens=6000,
            response_format={"type": "json_object"}
        )

        response_text = chat_completion.choices[0].message.content
        data = json.loads(response_text)
        return data

    except Exception as e:
        print(f"Error in generate-blueprint: {e}")
        # Return error as standard HTTP exception
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-database-schema")
async def generate_database_schema(request: GenerateDatabaseSchemaRequest):
    try:
        model = model_llm

        prompt = f"""
          You are "Schema-DB", a professional Database Architect. Your mission is to design a clear, normalized, and efficient relational database schema based on a project's description, user stories, and API endpoints.

          ---
          ## Full Project Context
          {request.projectContext}
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
          {{
            "schema": [
              {{
                "table_name": "users",
                "columns": [
                  {{ "name": "id", "type": "UUID", "is_primary_key": true }},
                  {{ "name": "email", "type": "TEXT" }},
                  {{ "name": "created_at", "type": "TIMESTAMPZ" }}
                ]
              }},
              {{
                "table_name": "posts",
                "columns": [
                  {{ "name": "id", "type": "UUID", "is_primary_key": true }},
                  {{ "name": "content", "type": "TEXT" }},
                  {{ "name": "user_id", "type": "UUID", "is_foreign_key": true, "references": "users(id)" }}
                ]
              }}
            ]
          }}
        """

        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "user", "content": prompt}
            ],
            model=model_llm,
            temperature=0.7, # Rendah untuk presisi teknis
            response_format={"type": "json_object"}
        )

        response_text = chat_completion.choices[0].message.content
        generated_schema = json.loads(response_text)

        # Save to Supabase
        data, count = supabase.table("database_schemas").upsert(
            {
            "project_id": request.projectId,
            "schema_data": generated_schema,
            "updated_at": "now()"
            },
            on_conflict="project_id"
        ).execute()
        
        return generated_schema

    except Exception as e:
        print(f"Error in generate-database-schema: {e}")
        raise HTTPException(status_code=500, detail=str(e))
