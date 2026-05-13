from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import upload, plagiarism, review
from utils.file_utils import ensure_upload_dir

app = FastAPI(
    title="Code Review & Plagiarism Detection API",
    description="MVP backend for academic code submission analysis",
    version="1.0.0",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
# Allows the React frontend (running on any localhost port) to call this API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Startup ───────────────────────────────────────────────────────────────────
@app.on_event("startup")
async def startup_event():
    ensure_upload_dir()

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(upload.router,     prefix="/api/upload",     tags=["Upload"])
app.include_router(plagiarism.router, prefix="/api/plagiarism", tags=["Plagiarism"])
app.include_router(review.router,     prefix="/api/review",     tags=["AI Review"])

# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
async def root():
    return {"status": "ok", "message": "Backend is running"}