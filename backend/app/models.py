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
