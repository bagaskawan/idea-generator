import os
import json
import google.generativeai as genai
from fastapi import APIRouter, HTTPException
from ..models import IdeaRequest, IdeaResponse, GenerateBlueprintRequest, BlueprintResponse
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model_flash = genai.GenerativeModel("gemini-2.5-flash")
# Use a more capable model for blueprint if possible, but flash is good for speed/cost. 
# The original code used gemini-2.5-flash which might be a typo or a specific preview model. 
# I will use gemini-1.5-flash for consistency or update if needed.
# Converting strictly from existing code.

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
            "projectDescription": "2-3 sentences explaining the core value and solution.",
            "uniqueSellingProposition": "The key differentiator that makes this special.",
            "mvpFeatures": ["Feature 1", "Feature 2", "Feature 3"]
          }},
          ...
        ]
        """

        response = model_flash.generate_content(prompt)
        cleaned_text = response.text.replace("```json", "").replace("```", "").strip()
        data = json.loads(cleaned_text)
        return {"ideas": data}

    except Exception as e:
        print(f"Error in generate-list: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-blueprint")
async def generate_blueprint(request: GenerateBlueprintRequest):
    try:
        # Using a slightly stronger model prompt logic if needed
        # Original code used "gemini-2.5-flash" - I will stick to what's available or configured.
        
        prompt = f"""
          You are "Architech", a world-class CTO and Digital Product Architect.
          Your mission is to expand a chosen project idea into a complete, professional, and actionable project blueprint. You will be given the entire context of the user's journey, from initial interest to the final selected idea.

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
        """

        response = model_flash.generate_content(prompt)
        cleaned_text = response.text.replace("```json", "").replace("```", "").strip()
        data = json.loads(cleaned_text)
        return data

    except Exception as e:
        print(f"Error in generate-blueprint: {e}")
        # Return error as standard HTTP exception
        raise HTTPException(status_code=500, detail=str(e))
