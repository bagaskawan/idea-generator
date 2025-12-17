from pydantic import BaseModel
from typing import List, Optional, Union, Dict, Any

class StartInterviewRequest(BaseModel):
    interest: str

class ConversationItem(BaseModel):
    role: str
    content: str

class IdeaRequest(BaseModel):
    interest: str
    conversation: List[Any] = [] # Keeping it flexible as the frontend sends different structures sometimes

class GenerateBlueprintRequest(BaseModel):
    interest: str
    conversation: List[Any]
    projectName: str
    projectDescription: str
    mvpFeatures: List[str]
    uniqueSellingProposition: str
    reasonProjectName: str

class IdeaResponse(BaseModel):
    projectName: str
    reasonProjectName: str
    projectDescription: str
    uniqueSellingProposition: str
    mvpFeatures: List[str]

class Audience(BaseModel):
    icon: str
    text: str

class SuccessMetric(BaseModel):
    type: str
    text: str

class ProjectData(BaseModel):
    title: str
    title_reason: str
    problem_statement: str
    target_audience: List[Audience]
    success_metrics: List[SuccessMetric]
    tech_stack: List[str]

class BlueprintResponse(BaseModel):
    projectData: ProjectData
    workbenchContent: str

class GenerateDatabaseSchemaRequest(BaseModel):
    projectId: str
    projectContext: str

class EditorCompletionRequest(BaseModel):
    context: str
    prompt: Optional[str] = None

# Guide Models
class GenerateGuideRequest(BaseModel):
    workbenchContent: str

class TaskProgressRequest(BaseModel):
    taskId: str
    projectId: str
    isCompleted: bool

class TaskContentBlockResponse(BaseModel):
    id: str
    type: str  # 'text', 'code', 'terminal', 'tip'
    content: str
    language: Optional[str] = None
    filename: Optional[str] = None
    display_order: int

class TaskResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    estimated_time: Optional[str] = None
    display_order: int
    content_blocks: List[TaskContentBlockResponse] = []
    is_completed: bool = False

class TaskCategoryResponse(BaseModel):
    id: str
    name: str
    icon: Optional[str] = None
    display_order: int
    tasks: List[TaskResponse] = []

class GuideResponse(BaseModel):
    categories: List[TaskCategoryResponse]
    total_tasks: int
    completed_tasks: int

