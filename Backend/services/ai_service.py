"""
AI Service — wraps OpenAI API calls for question generation and answer evaluation.
All prompts are loaded from utils/prompt_templates.py for easy iteration.
"""

import json
import os
from openai import OpenAI
from typing import List
from dotenv import load_dotenv

from models.interview_models import EvaluationResponse, FinalReportResponse
from utils.prompt_templates import (
    get_question_generation_prompt,
    get_evaluation_prompt,
    get_final_report_prompt,
)

load_dotenv()

# ---------------------------------------------------------------------------
# Provider configuration
# Supports OpenAI and Gemini (via Gemini's OpenAI-compatible endpoint).
#
# To use Gemini (free):
#   1. Get a free key at https://aistudio.google.com/apikey
#   2. Set GEMINI_API_KEY in .env  (leave OPENAI_API_KEY blank or remove it)
#
# To use OpenAI: set OPENAI_API_KEY in .env (leave GEMINI_API_KEY blank)
# ---------------------------------------------------------------------------

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GROQ_API_KEY   = os.getenv("GROQ_API_KEY", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

if GROQ_API_KEY:
    # Groq — free tier, 6000 req/day, OpenAI-compatible, uses Llama 3
    # Get free key at: https://console.groq.com/keys
    client = OpenAI(
        api_key=GROQ_API_KEY,
        base_url="https://api.groq.com/openai/v1",
    )
    MODEL = "llama-3.3-70b-versatile"   # best free model on Groq

elif GEMINI_API_KEY:
    # Gemini — free tier via OpenAI-compatible endpoint
    # Get free key at: https://aistudio.google.com/apikey
    client = OpenAI(
        api_key=GEMINI_API_KEY,
        base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
    )
    MODEL = "gemini-1.5-flash"          # stable free tier model

elif OPENAI_API_KEY:
    client = OpenAI(api_key=OPENAI_API_KEY)
    MODEL = "gpt-4o-mini"

else:
    raise RuntimeError(
        "No AI API key found. Set one of: GROQ_API_KEY, GEMINI_API_KEY, or OPENAI_API_KEY in Backend/.env"
    )


async def generate_questions(role: str, difficulty: str, num_questions: int = 5) -> List[str]:
    """
    Generate interview questions for the given role and difficulty.
    Returns a list of question strings.
    """
    prompt = get_question_generation_prompt(role, difficulty, num_questions)

    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.8,  # slight creativity for varied questions
        response_format={"type": "json_object"},
    )

    content = response.choices[0].message.content
    data = json.loads(content)

    # Handle {"questions": [...]} or direct array formats
    if isinstance(data, list):
        return data[:num_questions]
    if "questions" in data and isinstance(data["questions"], list):
        return data["questions"][:num_questions]

    # Fallback: grab the first list value found
    for value in data.values():
        if isinstance(value, list):
            return value[:num_questions]

    raise ValueError(f"Could not parse questions from OpenAI response: {content}")


async def evaluate_answer(question: str, answer: str, role: str) -> EvaluationResponse:
    """
    Evaluate a candidate's answer using OpenAI.
    Returns a structured EvaluationResponse with score, feedback, improvement, and follow_up.
    """
    # Handle empty or very short answers gracefully
    if not answer or len(answer.strip()) < 5:
        return EvaluationResponse(
            score=1,
            feedback="No meaningful answer was provided.",
            improvement="Please attempt to answer the question with as much detail as you know.",
            follow_up=None,
        )

    prompt = get_evaluation_prompt(question, answer, role)

    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,  # low temperature for consistent, accurate evaluation
        response_format={"type": "json_object"},
    )

    content = response.choices[0].message.content
    data = json.loads(content)

    return EvaluationResponse(
        score=int(data.get("score", 5)),
        feedback=data.get("feedback", "Unable to evaluate answer."),
        improvement=data.get("improvement", "Review the topic and try again."),
        follow_up=data.get("follow_up"),
    )


async def generate_final_report(role: str, questions_and_evaluations: list) -> FinalReportResponse:
    """
    Generate a comprehensive final interview report from all Q&A pairs.
    Returns overall score, strengths, weaknesses, and improvement plan.
    """
    if not questions_and_evaluations:
        raise ValueError("No evaluations provided for final report")

    prompt = get_final_report_prompt(role, questions_and_evaluations)

    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        response_format={"type": "json_object"},
    )

    content = response.choices[0].message.content
    data = json.loads(content)

    # Calculate real average as fallback in case model returns wrong value
    avg = sum(qa["score"] for qa in questions_and_evaluations) / len(questions_and_evaluations)

    return FinalReportResponse(
        overall_score=round(float(data.get("overall_score", avg)), 1),
        strengths=data.get("strengths", []),
        weaknesses=data.get("weaknesses", []),
        improvement_plan=data.get("improvement_plan", []),
        summary=data.get("summary", ""),
    )
