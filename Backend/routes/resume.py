"""
Resume routes — upload, analyze, and generate interview questions from a resume.

Endpoints:
  POST /resume/upload    — Upload a PDF/DOCX file, extract + return text
  POST /resume/analyze   — Analyze extracted text with AI, return structured report
  POST /resume/questions — Generate interview questions from a skill list
"""

import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException

from services.resume_parser import parse_resume
from services.resume_analyzer import analyze_resume
from services.skill_extractor import extract_skills
from services.skill_extractor import extract_projects
from services.ai_service import client, MODEL
from models.resume_models import (
    ResumeAnalysis,
    ResumeAnalyzeRequest,
    ResumeQuestionsRequest,
    ResumeQuestionsResponse,
)
from utils.prompt_templates import get_resume_questions_prompt

import json

router = APIRouter()

# In-memory session store (same pattern as interview sessions)
resume_sessions: dict = {}


@router.post("/upload")
async def upload_resume(file: UploadFile = File(...)):
    """
    Upload a PDF or DOCX resume file.
    Parses the file and returns the extracted text + detected skills.

    Returns:
        {
            "text": "<full extracted resume text>",
            "filename": "<original filename>",
            "char_count": <int>,
            "skills_preview": ["React", "Node.js", ...]  // quick extraction
        }
    """
    text = await parse_resume(file)
    skills_preview = await extract_skills(text)
    projects_preview= await extract_projects(text)

    return {
        "text": text,
        "filename": file.filename,
        "char_count": len(text),
        "skills_preview": skills_preview,
        "projects":projects_preview
    }


@router.post("/analyze", response_model=ResumeAnalysis)
async def analyze_resume_endpoint(request: ResumeAnalyzeRequest):
    """
    Analyze extracted resume text using AI.
    Returns a structured report with score, skills, strengths, and improvements.

    Body: { "text": "<resume plain text>" }
    """
    if not request.text or len(request.text.strip()) < 50:
        raise HTTPException(
            status_code=400,
            detail="Resume text is too short. Please upload a valid resume.",
        )

    analysis = await analyze_resume(request.text)
    return analysis


@router.post("/questions", response_model=ResumeQuestionsResponse)
async def generate_resume_questions(request: ResumeQuestionsRequest):
    """
    Generate technical interview questions tailored to the candidate's extracted skills.
    Creates a session that integrates with the existing /interview/evaluate endpoint.

    Body:
        {
            "skills": ["React", "Node.js", "Docker"],
            "experience_level": "Mid-level",
            "difficulty": "Medium",
            "num_questions": 5
            "projects":["AI Resume Alalyzer","AI Chat Bot"]
        }
    """
    if not request.skills:
        raise HTTPException(
            status_code=400,
            detail="No skills provided. Please analyze a resume first.",
        )

    prompt = get_resume_questions_prompt(
        skills=request.skills,
        experience_level=request.experience_level,
        difficulty=request.difficulty,
        num_questions=request.num_questions,
        projects=request.projects,
    )

    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.8,
        response_format={"type": "json_object"},
    )

    content = response.choices[0].message.content
    data = json.loads(content)

    questions = data.get("questions", [])
    if not questions or not isinstance(questions, list):
        raise HTTPException(
            status_code=500,
            detail="Failed to generate interview questions. Please try again.",
        )

    questions = questions[: request.num_questions]

    # Create a session so /interview/evaluate can be reused
    session_id = str(uuid.uuid4())
    role_label = f"Resume-based ({request.experience_level})"

    resume_sessions[session_id] = {
        "role": role_label,
        "difficulty": request.difficulty,
        "questions": questions,
        "skills": request.skills,
        "evaluations": [],
        "current_question": 0,
    }

    # Also register in the main interview sessions dict so evaluate works
    try:
        from routes.interview import sessions as interview_sessions

        interview_sessions[session_id] = {
            "role": role_label,
            "difficulty": request.difficulty,
            "interview_type": "text",
            "questions": questions,
            "evaluations": [],
            "current_question": 0,
        }
    except ImportError:
        pass  # Not fatal — evaluate will still work via direct API call

    return ResumeQuestionsResponse(
        session_id=session_id,
        questions=questions,
        role=role_label,
    )
