"""
Pydantic models for resume analysis endpoints.
"""

from pydantic import BaseModel
from typing import List, Optional


class Project(BaseModel):
    name: str
    description: str
    technologies: List[str]

class ResumeAnalysis(BaseModel):
    score: int
    skills: List[str]
    experience_level: str
    strengths: List[str]
    missing_skills: List[str]
    improvements: List[str]
    projects: List[Project]


class ResumeAnalyzeRequest(BaseModel):
    text: str


class ResumeQuestionsRequest(BaseModel):
    skills: List[str]
    experience_level: Optional[str] = "Mid-level"
    difficulty: Optional[str] = "Medium"
    num_questions: Optional[int] = 5
    projects: List[Project]


class ResumeQuestionsResponse(BaseModel):
    session_id: str
    questions: List[str]
    role: str
