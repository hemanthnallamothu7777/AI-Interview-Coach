"""
Evaluation routes — handles final report generation and standalone answer evaluation.
"""

from fastapi import APIRouter, HTTPException

from models.interview_models import (
    FinalReportRequest,
    FinalReportResponse,
    EvaluationResponse,
)
from services.ai_service import generate_final_report, evaluate_answer

router = APIRouter(tags=["evaluation"])


@router.post("/report", response_model=FinalReportResponse)
async def generate_report(request: FinalReportRequest):
    """
    Generate a comprehensive final interview report.
    Accepts all Q&A evaluations and returns overall score, strengths, weaknesses, and plan.
    """
    if not request.evaluations:
        raise HTTPException(status_code=400, detail="At least one evaluation is required to generate a report.")

    # Build the list expected by generate_final_report
    questions_and_evaluations = [
        {
            "question": ev.question,
            "answer": ev.answer,
            "score": ev.score,
            "feedback": ev.feedback,
            "improvement": ev.improvement,
        }
        for ev in request.evaluations
    ]

    try:
        return await generate_final_report(request.role, questions_and_evaluations)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate report: {str(e)}")


@router.post("/quick-evaluate", response_model=EvaluationResponse)
async def quick_evaluate(question: str, answer: str, role: str):
    """
    Evaluate a single answer without a session — useful for testing or standalone feedback.
    """
    try:
        return await evaluate_answer(question=question, answer=answer, role=role)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Evaluation failed: {str(e)}")
