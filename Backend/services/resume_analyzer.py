"""
Resume Analyzer — uses the AI service to analyze extracted resume text.
Returns a structured analysis with score, skills, strengths, and improvement suggestions.
"""

import json
from services.ai_service import client, MODEL
from models.resume_models import ResumeAnalysis
from utils.prompt_templates import get_resume_analysis_prompt


async def analyze_resume(text: str) -> ResumeAnalysis:
    """
    Analyze resume text using the AI model.

    Args:
        text: Plain text extracted from the resume

    Returns:
        ResumeAnalysis with score, skills, experience level, strengths,
        missing skills, and improvement suggestions.
    """
    prompt = get_resume_analysis_prompt(text)

    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,
        response_format={"type": "json_object"},
    )

    content = response.choices[0].message.content
    data = json.loads(content)

    return ResumeAnalysis(
        score=int(data.get("score", 50)),
        skills=data.get("skills", []),
        experience_level=data.get("experience_level", "Mid-level"),
        projects=data.get("projects",[]),
        strengths=data.get("strengths", []),
        missing_skills=data.get("missing_skills", []),
        improvements=data.get("improvements", []),
    )
