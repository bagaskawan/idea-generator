import os
import json
from groq import Groq
from fastapi import APIRouter, HTTPException
from ..models import GenerateGuideRequest, TaskProgressRequest, GuideResponse
from dotenv import load_dotenv
from supabase import create_client, Client
from typing import Optional

load_dotenv()

router = APIRouter()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
model_llm = "llama-3.3-70b-versatile"

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)


@router.post("/generate/{project_id}")
async def generate_guide(project_id: str, request: GenerateGuideRequest):
    """
    Generate implementation guide from workbench content using AI.
    Parses Task Breakdown and generates step-by-step code snippets.
    """
    try:
        # First, check if guide already exists
        existing = supabase.table("task_categories").select("id").eq("project_id", project_id).execute()
        if existing.data and len(existing.data) > 0:
            # Delete existing guide data to regenerate
            supabase.table("task_categories").delete().eq("project_id", project_id).execute()

        prompt = f"""You are an expert coding mentor. Analyze this project blueprint and create a detailed implementation guide with code snippets.

PROJECT BLUEPRINT:
{request.workbenchContent}

TASK:
1. Extract or infer task categories (e.g., "Project Setup", "Frontend", "Backend", "Database", "Authentication", "Deployment")
2. For each category, create 3-7 specific implementation tasks
3. For each task, provide step-by-step guidance with actual code snippets

OUTPUT FORMAT (JSON):
{{
  "categories": [
    {{
      "name": "Category Name",
      "icon": "rocket",  // lucide icon name: rocket, code, database, shield, cloud, etc.
      "tasks": [
        {{
          "title": "Task Title",
          "description": "Brief description of what this task accomplishes",
          "estimated_time": "10 min",
          "content_blocks": [
            {{
              "type": "text",
              "content": "Explanation of what to do"
            }},
            {{
              "type": "terminal",
              "content": "npm install package-name"
            }},
            {{
              "type": "code",
              "language": "typescript",
              "filename": "src/example.ts",
              "content": "// Code snippet here\\nconst example = 'code';"
            }},
            {{
              "type": "tip",
              "content": "💡 Pro tip or warning here"
            }}
          ]
        }}
      ]
    }}
  ]
}}

RULES:
- Generate realistic, working code snippets based on the tech stack mentioned
- Include terminal commands for installations
- Add helpful tips and warnings
- Each task should have 2-6 content blocks
- Use proper escaping for code strings
- Match the language/style of the original content (English or Indonesian)
"""

        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model=model_llm,
            temperature=0.7,
            max_completion_tokens=8000,
            response_format={"type": "json_object"}
        )

        response_text = chat_completion.choices[0].message.content
        guide_data = json.loads(response_text)

        # Save to database
        saved_categories = []
        
        for cat_idx, category in enumerate(guide_data.get("categories", [])):
            # Insert category
            cat_result = supabase.table("task_categories").insert({
                "project_id": project_id,
                "name": category["name"],
                "icon": category.get("icon", "folder"),
                "display_order": cat_idx
            }).execute()
            
            category_id = cat_result.data[0]["id"]
            saved_tasks = []
            
            for task_idx, task in enumerate(category.get("tasks", [])):
                # Insert task
                task_result = supabase.table("tasks").insert({
                    "category_id": category_id,
                    "project_id": project_id,
                    "title": task["title"],
                    "description": task.get("description", ""),
                    "estimated_time": task.get("estimated_time"),
                    "display_order": task_idx
                }).execute()
                
                task_id = task_result.data[0]["id"]
                saved_blocks = []
                
                for block_idx, block in enumerate(task.get("content_blocks", [])):
                    # Insert content block
                    block_result = supabase.table("task_content_blocks").insert({
                        "task_id": task_id,
                        "block_type": block["type"],
                        "content": block["content"],
                        "language": block.get("language"),
                        "filename": block.get("filename"),
                        "display_order": block_idx
                    }).execute()
                    
                    saved_blocks.append({
                        "id": block_result.data[0]["id"],
                        "type": block["type"],
                        "content": block["content"],
                        "language": block.get("language"),
                        "filename": block.get("filename"),
                        "display_order": block_idx
                    })
                
                saved_tasks.append({
                    "id": task_id,
                    "title": task["title"],
                    "description": task.get("description", ""),
                    "estimated_time": task.get("estimated_time"),
                    "display_order": task_idx,
                    "content_blocks": saved_blocks,
                    "is_completed": False
                })
            
            saved_categories.append({
                "id": category_id,
                "name": category["name"],
                "icon": category.get("icon", "folder"),
                "display_order": cat_idx,
                "tasks": saved_tasks
            })

        total_tasks = sum(len(cat["tasks"]) for cat in saved_categories)
        
        return {
            "categories": saved_categories,
            "total_tasks": total_tasks,
            "completed_tasks": 0
        }

    except Exception as e:
        print(f"Error in generate-guide: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{project_id}")
async def get_guide(project_id: str, user_id: Optional[str] = None):
    """
    Fetch complete guide data for a project with user's progress.
    """
    try:
        # Get categories
        categories_result = supabase.table("task_categories")\
            .select("*")\
            .eq("project_id", project_id)\
            .order("display_order")\
            .execute()
        
        if not categories_result.data:
            return {"categories": [], "total_tasks": 0, "completed_tasks": 0}
        
        # Get all tasks for this project
        tasks_result = supabase.table("tasks")\
            .select("*")\
            .eq("project_id", project_id)\
            .order("display_order")\
            .execute()
        
        # Get all content blocks for tasks
        task_ids = [t["id"] for t in tasks_result.data] if tasks_result.data else []
        
        blocks_result = None
        if task_ids:
            blocks_result = supabase.table("task_content_blocks")\
                .select("*")\
                .in_("task_id", task_ids)\
                .order("display_order")\
                .execute()
        
        # Get progress for this project (load all progress, not just for specific user)
        progress_map = {}
        progress_result = supabase.table("task_progress")\
            .select("task_id, is_completed")\
            .eq("project_id", project_id)\
            .execute()
        
        if progress_result.data:
            progress_map = {p["task_id"]: p["is_completed"] for p in progress_result.data}
        
        # Build nested structure
        blocks_by_task = {}
        if blocks_result and blocks_result.data:
            for block in blocks_result.data:
                task_id = block["task_id"]
                if task_id not in blocks_by_task:
                    blocks_by_task[task_id] = []
                blocks_by_task[task_id].append({
                    "id": block["id"],
                    "type": block["block_type"],
                    "content": block["content"],
                    "language": block.get("language"),
                    "filename": block.get("filename"),
                    "display_order": block["display_order"]
                })
        
        tasks_by_category = {}
        completed_count = 0
        for task in tasks_result.data or []:
            cat_id = task["category_id"]
            if cat_id not in tasks_by_category:
                tasks_by_category[cat_id] = []
            
            is_completed = progress_map.get(task["id"], False)
            if is_completed:
                completed_count += 1
                
            tasks_by_category[cat_id].append({
                "id": task["id"],
                "title": task["title"],
                "description": task.get("description"),
                "estimated_time": task.get("estimated_time"),
                "display_order": task["display_order"],
                "content_blocks": blocks_by_task.get(task["id"], []),
                "is_completed": is_completed
            })
        
        categories = []
        for cat in categories_result.data:
            categories.append({
                "id": cat["id"],
                "name": cat["name"],
                "icon": cat.get("icon"),
                "display_order": cat["display_order"],
                "tasks": tasks_by_category.get(cat["id"], [])
            })
        
        total_tasks = len(tasks_result.data) if tasks_result.data else 0
        
        # Get last updated timestamp from task_progress
        last_updated = None
        last_updated_result = supabase.table("task_progress")\
            .select("updated_at")\
            .eq("project_id", project_id)\
            .order("updated_at", desc=True)\
            .limit(1)\
            .execute()
        
        if last_updated_result.data and len(last_updated_result.data) > 0:
            last_updated = last_updated_result.data[0].get("updated_at")
        
        return {
            "categories": categories,
            "total_tasks": total_tasks,
            "completed_tasks": completed_count,
            "last_updated": last_updated
        }

    except Exception as e:
        print(f"Error in get-guide: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/progress")
async def update_task_progress(request: TaskProgressRequest):
    """
    Update task completion status for a user.
    """
    try:
        # Get user_id from the task's project via tasks table
        task_result = supabase.table("tasks")\
            .select("project_id")\
            .eq("id", request.taskId)\
            .execute()
        
        if not task_result.data or len(task_result.data) == 0:
            raise HTTPException(status_code=404, detail="Task not found")
        
        # Now get user_id from projects table using RPC or direct query
        # Use a raw query approach to bypass potential RLS
        project_id = task_result.data[0]["project_id"]
        
        # Get user from projects - try with rpc if direct fails
        try:
            project_result = supabase.rpc("get_project_owner", {"p_id": project_id}).execute()
            if project_result.data:
                user_id = project_result.data
            else:
                # Fallback: use project_id as pseudo user_id (for testing only)
                user_id = project_id
        except:
            # If RPC doesn't exist, use project_id as fallback
            user_id = project_id
        
        from datetime import datetime
        current_time = datetime.utcnow().isoformat()
        
        # Upsert progress record with updated_at timestamp
        supabase.table("task_progress")\
            .upsert({
                "user_id": user_id,
                "task_id": request.taskId,
                "project_id": request.projectId,
                "is_completed": request.isCompleted,
                "updated_at": current_time,
                "completed_at": current_time if request.isCompleted else None
            }, on_conflict="task_id")\
            .execute()
        
        return {"success": True, "is_completed": request.isCompleted}

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in update-task-progress: {e}")
        raise HTTPException(status_code=500, detail=str(e))
