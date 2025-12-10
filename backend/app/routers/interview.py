import os
import json
import google.generativeai as genai
from fastapi import APIRouter, HTTPException
from ..models import StartInterviewRequest, IdeaRequest
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

@router.post("/start")
async def start_interview(request: StartInterviewRequest):
    if os.getenv("MOCK_AI_RESPONSES") == "true":
         # Return mock data if needed (Implement mock logic if required)
         pass

    model = genai.GenerativeModel("gemini-2.5-flash") # Or gemini-2.0-flash if available

    prompt = f"""
      You are a friendly, highly experienced project consultant for software developer conducting a short but impactful interview.
      The user's initial interest is: "{request.interest}".

      Your mission is to unlock their vision by asking one single, most valuable follow-up question that helps clarify their core idea.

      Instructions:

      Language Match: Carefully analyze the language of the user's interest ("{request.interest}") and write your question in that exact same language.

      Tone: Keep your tone professional yet approachable, encouraging the user to think deeper. Avoid rigid formalities such as "Bapak/Ibu" or "Sir/Madam".

      Format: Your output MUST be a single, valid JSON object with only one key: "question". No extra commentary, no markdown, no additional fields.

      Impact: The question should spark clarity, highlight priorities, and guide the user to define the essence of their idea.

      Example 1 (User input in Indonesian):

      User Interest: "Aplikasi kasir untuk warung kopi"

      Output: {{ "question": "Ide yang menarik! Menurut Anda, fitur apa yang paling penting untuk ada di versi pertama aplikasi ini?" }}

      Example 2 (User input in English):

      User Interest: "A workout planner app"

      Output: {{ "question": "Sounds exciting! Who do you see as the main target users for this workout planner?" }}
    """

    try:
        response = model.generate_content(prompt)
        text = response.text
        
        # Clean up JSON
        cleaned_text = text.replace("```json", "").replace("```", "").strip()
        data = json.loads(cleaned_text)
        
        return data

    except Exception as e:
        print(f"Error in start-interview API: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/continue")
async def continue_interview(request: IdeaRequest):
    model = genai.GenerativeModel("gemini-2.5-flash")
    
    prompt = f"""
      You are a friendly and insightful project consultant for software developers, conducting an interview.
      The user's initial interest is: "{request.interest}".
      The conversation history so far is: {json.dumps(request.conversation, default=str)}.

      Your role is to carefully analyze the entire conversation history and ask the next most logical follow-up question that drives clarity and progress.

      Instructions:

      Language Match: Always ask the question in the same language as the user's interest and prior conversation.

      Uniqueness: Do not repeat or rephrase any previous questions. Ensure each new question adds fresh value.

      Clarity: The question must be concise, precise, and thought-provoking.

      Format: Output MUST be a single, valid JSON object with one key only: "question". No explanations, no markdown, no additional keys.

      Impact: The follow-up should encourage the user to refine their vision, uncover priorities, or make a meaningful decision.

      Example 1 (User input in Indonesian):

      User Interest: "Platform pembelajaran online untuk siswa SMA"

      Output: {{ "question": "Fokus utama apa yang ingin Anda capai terlebih dahulu dengan platform ini?" }}

      Example 2 (User input in English):

      User Interest: "An AI-powered nutrition tracker"

      Output: {{ "question": "Which specific problem do you want this nutrition tracker to solve first?" }}
    """

    try:
        response = model.generate_content(prompt)
        text = response.text
        cleaned_text = text.replace("```json", "").replace("```", "").strip()
        data = json.loads(cleaned_text)
        return data

    except Exception as e:
        print(f"Error in continue-interview API: {e}")
        raise HTTPException(status_code=500, detail=str(e))

