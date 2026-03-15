"""
AI Interview Coach — FastAPI Backend
Entry point: uvicorn main:app --reload
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from routes.interview import router as interview_router
from routes.evaluation import router as evaluation_router

app = FastAPI(
    title="AI Interview Coach API",
    description="Production-ready backend for AI-powered technical interview simulation",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Allowed origins (local development + deployed frontend)
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "https://ai-interview-coach-peach.vercel.app",  # replace with your actual Vercel URL
]

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers with URL prefixes
app.include_router(interview_router, prefix="/interview", tags=["Interview"])
app.include_router(evaluation_router, prefix="/evaluation", tags=["Evaluation"])


@app.get("/", tags=["health"])
async def root():
    return {
        "message": "AI Interview Coach API",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health", tags=["health"])
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000)