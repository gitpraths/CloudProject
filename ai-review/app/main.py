from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.review import router as review_router

app = FastAPI(
    title="AI Code Review Service",
    description="AI-powered code review using Vertex AI Gemini",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(review_router, prefix="/api", tags=["review"])


@app.get("/")
def root():
    return {"message": "AI Code Review Service is running"}


@app.get("/health")
def health():
    return {"status": "ok"}
