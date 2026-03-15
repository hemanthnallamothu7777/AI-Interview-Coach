"""
Interview routes — handles session lifecycle, answer submission, and voice tokens.

Sessions are stored in memory (dict) for simplicity.
In production, replace with Redis or a database.
"""

import uuid
import json
from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from typing import Dict

from models.interview_models import (
    InterviewStartRequest,
    InterviewStartResponse,
    AnswerSubmitRequest,
    EvaluationResponse,
    LiveKitTokenRequest,
    LiveKitTokenResponse,
)
from services.ai_service import generate_questions, evaluate_answer
from services.livekit_service import generate_token, create_room, is_livekit_configured

router = APIRouter(tags=["interview"])

# In-memory session store: session_id → session dict
# Replace with Redis/DB in production
sessions: Dict[str, dict] = {}


@router.post("/start", response_model=InterviewStartResponse)
async def start_interview(request: InterviewStartRequest):
    """
    Start a new interview session.
    Generates AI questions and optionally sets up a LiveKit voice room.
    """
    session_id = str(uuid.uuid4())

    # Generate questions via OpenAI
    questions = await generate_questions(
        role=request.role,
        difficulty=request.difficulty,
        num_questions=request.num_questions,
    )

    if not questions:
        raise HTTPException(status_code=500, detail="Failed to generate interview questions")

    # Initialize session state
    sessions[session_id] = {
        "role": request.role,
        "difficulty": request.difficulty,
        "interview_type": request.interview_type,
        "questions": questions,
        "evaluations": [],
        "current_question": 0,
    }

    room_name = None
    livekit_token = None

    # Set up LiveKit room for voice interviews (optional — falls back gracefully)
    if request.interview_type == "voice" and is_livekit_configured():
        room_name = f"interview-{session_id[:8]}"
        try:
            await create_room(room_name)
            token_data = await generate_token(room_name, "candidate")
            livekit_token = token_data["token"]
        except Exception as e:
            # Non-fatal: voice mode can use browser APIs without LiveKit
            print(f"[LiveKit] Room setup failed (falling back to browser mode): {e}")
            room_name = None

    return InterviewStartResponse(
        session_id=session_id,
        questions=questions,
        room_name=room_name,
        livekit_token=livekit_token,
    )


@router.post("/evaluate", response_model=EvaluationResponse)
async def evaluate_answer_endpoint(request: AnswerSubmitRequest):
    """
    Evaluate a candidate's answer to a specific question.
    Stores the evaluation in the session for the final report.
    """
    if request.session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found. Please start a new interview.")

    session = sessions[request.session_id]

    # Evaluate using OpenAI
    evaluation = await evaluate_answer(
        question=request.question,
        answer=request.answer,
        role=request.role,
    )

    # Persist evaluation with full context for final report generation
    session["evaluations"].append({
        "question": request.question,
        "answer": request.answer,
        "score": evaluation.score,
        "feedback": evaluation.feedback,
        "improvement": evaluation.improvement,
    })
    session["current_question"] = request.question_index + 1

    return evaluation


@router.post("/livekit-token", response_model=LiveKitTokenResponse)
async def get_livekit_token(request: LiveKitTokenRequest):
    """Generate a LiveKit access token for joining a voice room."""
    if not is_livekit_configured():
        raise HTTPException(
            status_code=503,
            detail="LiveKit is not configured on this server. Voice mode unavailable.",
        )
    try:
        token_data = await generate_token(request.room_name, request.participant_name)
        return LiveKitTokenResponse(token=token_data["token"], url=token_data["url"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate LiveKit token: {str(e)}")


@router.get("/session/{session_id}")
async def get_session(session_id: str):
    """Retrieve current session state (useful for reconnection)."""
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    # Return session without internal keys
    session = sessions[session_id]
    return {
        "session_id": session_id,
        "role": session["role"],
        "difficulty": session["difficulty"],
        "interview_type": session["interview_type"],
        "questions": session["questions"],
        "current_question": session["current_question"],
        "evaluations_count": len(session["evaluations"]),
    }


@router.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    """
    WebSocket endpoint for real-time voice interview updates.
    The frontend sends transcribed speech as JSON messages and receives evaluations.
    """
    await websocket.accept()

    if session_id not in sessions:
        await websocket.send_json({"type": "error", "message": "Session not found"})
        await websocket.close()
        return

    try:
        while True:
            raw = await websocket.receive_text()
            message = json.loads(raw)
            msg_type = message.get("type")

            if msg_type == "answer":
                # Voice answer received — evaluate and respond
                session = sessions[session_id]
                question_idx = session["current_question"]

                if question_idx < len(session["questions"]):
                    question = session["questions"][question_idx]
                    answer = message.get("answer", "")

                    evaluation = await evaluate_answer(
                        question=question,
                        answer=answer,
                        role=session["role"],
                    )

                    # Persist evaluation
                    session["evaluations"].append({
                        "question": question,
                        "answer": answer,
                        "score": evaluation.score,
                        "feedback": evaluation.feedback,
                        "improvement": evaluation.improvement,
                    })
                    session["current_question"] = question_idx + 1

                    await websocket.send_json({
                        "type": "evaluation",
                        "data": evaluation.dict(),
                        "question_index": question_idx,
                        "is_complete": session["current_question"] >= len(session["questions"]),
                    })
                else:
                    await websocket.send_json({"type": "error", "message": "All questions already answered"})

            elif msg_type == "ping":
                await websocket.send_json({"type": "pong"})

    except WebSocketDisconnect:
        print(f"[WS] Client disconnected from session {session_id}")
    except Exception as e:
        print(f"[WS] Error in session {session_id}: {e}")
        try:
            await websocket.send_json({"type": "error", "message": str(e)})
        except Exception:
            pass
