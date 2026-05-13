from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.review_service import run_ai_review

router = APIRouter()


class ReviewRequest(BaseModel):
    file_id: str


@router.post("/")
async def get_code_review(body: ReviewRequest):
    """
    Run AI-powered code review on an uploaded file.

    Requires a file_id obtained from POST /api/upload.

    Example request body:
    {
        "file_id": "uuid-of-file"
    }
    """
    result = run_ai_review(body.file_id)

    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])

    return {"success": True, "result": result}