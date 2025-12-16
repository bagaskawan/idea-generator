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
model_llm = "llama-3.3-70b-versatile"  # Valid Groq model (same as ai.py)

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
            "projectName": "Name of the project just 1 or 2 words",
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
        prompt = f"""You are Architech, a world-class CTO and Digital Product Architect.
Your mission is to expand a chosen project idea into a complete, professional, and actionable project blueprint.

CRITICAL: Be EXTREMELY VERBOSE. Do not summarize. Every section must be expanded with multiple paragraphs and deep technical details.

USER CONTEXT:
- Initial Interest: {request.interest}
- Clarification Interview: {json.dumps(request.conversation, default=str)}
- Project Description: {request.projectDescription}

SELECTED PROJECT IDEA:
- Project Name: {request.projectName}
- Unique Selling Proposition: {request.uniqueSellingProposition}
- Core MVP Features: {json.dumps(request.mvpFeatures, default=str)}

OUTPUT REQUIREMENTS - Return a valid JSON object with exactly two keys:

1. projectData (object with these exact fields):
   - title: string, use exactly "{request.projectName}"
   - title_reason: string, use exactly "{request.reasonProjectName}"
   - problem_statement: string, a concise paragraph explaining the core problem
   - target_audience: array of exactly 3 objects, each with "icon" (string) and "text" (string) properties
   - success_metrics: array of exactly 3 objects, each with "type" (string: Kuantitatif or Kualitatif) and "text" (string) properties
   - tech_stack: array of 5-7 technology strings

2. workbenchContent (string containing markdown with these sections):
   - Fitur Utama (Core Features) - detailed explanation of each MVP feature
   - Roadmap - phased plan (MVP, Phase 2, Future)
   - Task Breakdown - 10-15 tasks per category (Frontend, Backend, Database, DevOps)
   - User Stories - 7-10 detailed user stories
   - System Architecture - describe in PROSE ONLY, no diagrams
   - API Endpoints - at least 5 key endpoints with methods and sample requests
   - Strategi Monetisasi - 2-3 revenue strategies
   Every section will be heading 2 [##] and must be expanded with multiple paragraphs and deep technical details.

CRITICAL JSON FORMAT for arrays:
target_audience must be exactly like this:
[{{"icon": "student", "text": "Description here"}}, {{"icon": "professional", "text": "Description here"}}, {{"icon": "user", "text": "Description here"}}]

success_metrics must be exactly like this:
[{{"type": "Kuantitatif", "text": "Metric description"}}, {{"type": "Kuantitatif", "text": "Metric description"}}, {{"type": "Kualitatif", "text": "Metric description"}}]

CRITICAL RULES:
- Return ONLY valid JSON
- All arrays must contain properly formatted objects
- Match the language of the user input
- DO NOT use ASCII diagrams or code blocks with special characters in workbenchContent
- For System Architecture, describe in plain text paragraphs, NOT code blocks or diagrams
- Escape all special characters properly in the markdown string
"""

        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "user", "content": prompt}
            ],
            model=model_llm,
            temperature=0.7,
            max_completion_tokens=6000,
            response_format={"type": "json_object"}
        )

        response_text = chat_completion.choices[0].message.content
        data = json.loads(response_text)
        print("data blueprint: ", data)
        
        # Validate and fix target_audience if malformed
        if "projectData" in data:
            pd = data["projectData"]
            
            # Fix target_audience if it's malformed
            if "target_audience" in pd:
                ta = pd["target_audience"]
                if isinstance(ta, list) and len(ta) > 0:
                    # Check if first element is a dict with proper structure
                    if not isinstance(ta[0], dict) or "icon" not in ta[0]:
                        # Array is corrupted, provide default
                        pd["target_audience"] = [
                            {"icon": "user", "text": "General users interested in this application"},
                            {"icon": "professional", "text": "Professionals seeking productivity tools"},
                            {"icon": "student", "text": "Students and learners"}
                        ]
                else:
                    pd["target_audience"] = []
            
            # Fix success_metrics if it's malformed
            if "success_metrics" in pd:
                sm = pd["success_metrics"]
                if isinstance(sm, list) and len(sm) > 0:
                    if not isinstance(sm[0], dict) or "type" not in sm[0]:
                        pd["success_metrics"] = [
                            {"type": "Kuantitatif", "text": "Achieve 1,000 monthly active users within 6 months"},
                            {"type": "Kuantitatif", "text": "Maintain 40% user retention after 30 days"},
                            {"type": "Kualitatif", "text": "Achieve NPS score above 50"}
                        ]
                else:
                    pd["success_metrics"] = []

        return data

    except Exception as e:
        print(f"Error in generate-blueprint: {e}")
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


@router.post("/generate-flowchart")
async def generate_flowchart(request: GenerateDatabaseSchemaRequest):
    """Generate a Mermaid.js flowchart from project context"""
    try:
        prompt = f"""You are "ArchiGraph", a System Architect expert in Mermaid.js.
Create a System Architecture Flowchart for this project.

CONTEXT:
{request.projectContext}

STRICT SYNTAX RULES:
1. Start with exactly: graph TD
2. Arrow with label: A -->|label text| B (NO space after the pipe)
3. Arrow without label: A --> B
4. Node shapes:
   - Rectangle: [Text]
   - Rounded: (Text)
   - Circle: ((Text))
   - Cylinder: [(Text)]
   - Hexagon: {{{{Text}}}}

INCLUDE THESE COMPONENTS:
- User entry point
- Frontend layer
- Backend/API layer  
- Database
- External services if relevant

RETURN ONLY the Mermaid code. No markdown, no explanation.

EXAMPLE (copy this exact syntax style):
graph TD
    User((User)) -->|Request| FE[Frontend]
    FE -->|API Call| BE[Backend]
    BE -->|Query| DB[(Database)]
    BE -->|Auth| Auth{{Auth Service}}
"""

        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model=model_llm,
            temperature=0.1,  # Very low for consistent syntax
            max_completion_tokens=2000,
        )

        response_text = chat_completion.choices[0].message.content
        
        # Clean output - remove markdown code blocks
        clean_code = response_text.replace("```mermaid", "").replace("```", "").strip()
        
        # Sanitize common syntax errors from AI
        import re
        
        # Fix "|>" to "|" (invalid arrow ending)
        clean_code = clean_code.replace("|>", "|")
        
        # Fix mixed brackets like {( or ({ - convert to simple brackets
        clean_code = re.sub(r'\{\(', '{{', clean_code)  # {( -> {{
        clean_code = re.sub(r'\)\}', '}}', clean_code)  # )} -> }}
        clean_code = re.sub(r'\(\{', '{{', clean_code)  # ({ -> {{
        clean_code = re.sub(r'\}\)', '}}', clean_code)  # }) -> }}
        
        # Fix spaces in arrow labels: -->| label| to -->|label|
        clean_code = re.sub(r'-->\s*\|\s+', '-->|', clean_code)
        clean_code = re.sub(r'\s+\|(\s)', '|', clean_code)
        
        # Fix double spaces
        clean_code = re.sub(r'  +', ' ', clean_code)
        
        # Save to Supabase
        supabase.table("flowcharts").upsert({
            "project_id": request.projectId,
            "chart_code": clean_code,
            "updated_at": "now()"
        }, on_conflict="project_id").execute()
        
        return {"chart": clean_code}

    except Exception as e:
        print(f"Error in generate-flowchart: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/flowchart/{project_id}")
async def get_flowchart(project_id: str):
    """Get saved flowchart for a project"""
    try:
        result = supabase.table("flowcharts").select("chart_code").eq("project_id", project_id).single().execute()
        
        if result.data:
            return {"chart": result.data["chart_code"]}
        else:
            return {"chart": None}
    except Exception as e:
        # No flowchart found is not an error
        return {"chart": None}


