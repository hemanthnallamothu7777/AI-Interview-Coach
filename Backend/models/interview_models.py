from pydantic import BaseModel
from typing import List, Optional
from enum import Enum


class InterviewType(str, Enum):
    TEXT = "text"
    VOICE = "voice"


class InterviewStartRequest(BaseModel):
    role: str
    difficulty: str
    interview_type: InterviewType = InterviewType.TEXT
    num_questions: int = 5


class InterviewStartResponse(BaseModel):
    session_id: str
    questions: List[str]
    room_name: Optional[str] = None
    livekit_token: Optional[str] = None


class AnswerSubmitRequest(BaseModel):
    session_id: str
    question: str
    answer: str
    role: str
    question_index: int


class EvaluationResponse(BaseModel):
    score: int
    feedback: str
    improvement: str
    follow_up: Optional[str] = None


class EvaluationData(BaseModel):
    """Evaluation data with question context for final report."""
    question: str
    answer: str
    score: int
    feedback: str
    improvement: str


class FinalReportRequest(BaseModel):
    session_id: str
    role: str
    evaluations: List[EvaluationData]


class FinalReportResponse(BaseModel):
    overall_score: float
    strengths: List[str]
    weaknesses: List[str]
    improvement_plan: List[str]
    summary: str


class LiveKitTokenRequest(BaseModel):
    room_name: str
    participant_name: str


class LiveKitTokenResponse(BaseModel):
    token: str
    url: str
