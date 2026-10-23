import os
from typing import Any, Dict, List, Optional
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

import ai_service

app = FastAPI(
    title="StudyPilot Backend",
    description="FastAPI backend connecting StudyPilot frontend with real Gemini AI chat, study plan, and quiz endpoints.",
    version="1.1.0",
)

# CORS configuration
allowed_origins_env = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173",
)
origins = [origin.strip() for origin in allowed_origins_env.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Pydantic Data Models ---

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, description="User's input message")
    history: Optional[List[Dict[str, Any]]] = Field(
        default=None,
        description="Optional list of previous messages in conversation",
    )


class ChatResponse(BaseModel):
    reply: str = Field(..., description="Assistant reply message")
    response: str = Field(..., description="Assistant reply message (compatibility alias)")
    status: str = Field(default="ok", description="Status code or indicator")


class HealthResponse(BaseModel):
    status: str
    service: str = "StudyPilot Backend"
    ai_configured: bool = False


class StudyBlock(BaseModel):
    day: str
    taskTitle: str
    subject: str
    minutes: int
    priority: str


class StudySchedule(BaseModel):
    blocks: List[StudyBlock]
    explanation: str


class StudyPlanRequest(BaseModel):
    tasks: List[Dict[str, Any]] = Field(default_factory=list)
    availableMinutesPerDay: int = Field(default=120, ge=15)


class StudyPlanResponse(BaseModel):
    schedule: StudySchedule


class QuizQuestionModel(BaseModel):
    id: str
    question: str
    choices: List[str]
    correctIndex: int
    explanation: str
    subject: str


class QuizRequest(BaseModel):
    subject: str = Field(default="All Subjects")
    count: int = Field(default=6, ge=1, le=20)


class QuizResponse(BaseModel):
    questions: List[QuizQuestionModel]


# --- Error Handlers ---

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(_request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "Validation Error",
            "detail": exc.errors(),
        },
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(_request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail},
    )


@app.exception_handler(Exception)
async def generic_exception_handler(_request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"error": "An unexpected error occurred", "detail": str(exc)},
    )


# --- Endpoints ---

@app.get("/", tags=["General"])
async def root():
    return {
        "service": "StudyPilot Backend",
        "status": "online",
        "docs_url": "/docs",
        "ai_provider": "Google Gemini",
    }


@app.get("/health", response_model=HealthResponse, tags=["General"])
async def health_check():
    has_key = bool(os.getenv("GEMINI_API_KEY", "").strip())
    return HealthResponse(
        status="healthy",
        service="StudyPilot Backend",
        ai_configured=has_key,
    )


@app.post("/chat", response_model=ChatResponse, tags=["Chat"])
@app.post("/api/chat", response_model=ChatResponse, tags=["Chat"])
async def chat_handler(request: ChatRequest):
    cleaned_message = request.message.strip()
    if not cleaned_message:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message cannot be empty or contain only whitespace.",
        )

    try:
        ai_reply = ai_service.generate_chat_explanation(
            message=cleaned_message,
            history=request.history,
        )
        return ChatResponse(
            reply=ai_reply,
            response=ai_reply,
            status="ok",
        )
    except ValueError as e:
        # Missing API Key
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(e),
        )
    except Exception as e:
        err_str = str(e)
        if "429" in err_str or "RESOURCE_EXHAUSTED" in err_str:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Gemini API rate limit reached. Please wait a moment and try again.",
            )
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Gemini AI provider error: {err_str}",
        )


@app.post("/api/study-plan", response_model=StudyPlanResponse, tags=["Study Plan"])
@app.post("/study-plan", response_model=StudyPlanResponse, tags=["Study Plan"])
async def study_plan_handler(request: StudyPlanRequest):
    try:
        plan_dict = ai_service.generate_study_plan_ai(
            tasks=request.tasks,
            available_minutes=request.availableMinutesPerDay,
        )
        return StudyPlanResponse(schedule=StudySchedule(**plan_dict))
    except Exception as e:
        # Fallback to local heuristic algorithm if AI call fails
        blocks = []
        day_names = ["Today", "Tomorrow", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"]
        remaining = request.availableMinutesPerDay
        day_idx = 0

        incomplete = [t for t in request.tasks if not t.get("completed")]
        for task in incomplete:
            minutes = task.get("estimatedMinutes", 60)
            allocated = 0
            while allocated < minutes:
                if remaining <= 0:
                    day_idx += 1
                    remaining = request.availableMinutesPerDay
                chunk = min(minutes - allocated, remaining, 90)
                blocks.append(
                    StudyBlock(
                        day=day_names[min(day_idx, len(day_names) - 1)],
                        taskTitle=task.get("title", "Study Task"),
                        subject=task.get("subject", "General"),
                        minutes=chunk,
                        priority=task.get("priority", "medium"),
                    )
                )
                allocated += chunk
                remaining -= chunk

        explanation = f"Study schedule generated based on {len(incomplete)} upcoming tasks and your {request.availableMinutesPerDay}-minute daily study target."
        return StudyPlanResponse(schedule=StudySchedule(blocks=blocks, explanation=explanation))


@app.post("/api/quiz", response_model=QuizResponse, tags=["Quiz"])
@app.post("/quiz", response_model=QuizResponse, tags=["Quiz"])
async def quiz_handler(request: QuizRequest):
    try:
        raw_questions = ai_service.generate_quiz_ai(
            subject=request.subject,
            count=request.count,
        )
        questions = [QuizQuestionModel(**q) for q in raw_questions]
        return QuizResponse(questions=questions)
    except Exception as e:
        # Fallback to standard educational questions if AI call encounters issues
        sample_questions = [
            QuizQuestionModel(
                id="fb-q1",
                question=f"Which core concept is central to mastering {request.subject}?",
                choices=[
                    "Fundamental principles and active problem solving",
                    "Rote memorization without understanding",
                    "Skipping foundational theorems",
                    "Only reading summaries before the exam",
                ],
                correctIndex=0,
                explanation="Mastery requires understanding core principles and actively practicing problems.",
                subject=request.subject,
            )
        ]
        return QuizResponse(questions=sample_questions)


if __name__ == "__main__":
    import uvicorn

    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("main:app", host=host, port=port, reload=True)
