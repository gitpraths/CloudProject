from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.plagiarism_service import run_plagiarism_check

router = APIRouter()


class CompareRequest(BaseModel):
    file_id_1: str
    file_id_2: str


@router.post("/compare")
async def compare_files(body: CompareRequest):
    """
    Compare two uploaded files for plagiarism.

    Requires two file_ids obtained from POST /api/upload.

    Example request body:
    {
        "file_id_1": "uuid-of-first-file",
        "file_id_2": "uuid-of-second-file"
    }
    """
    if body.file_id_1 == body.file_id_2:
        raise HTTPException(status_code=400, detail="Cannot compare a file with itself.")

    result = run_plagiarism_check(body.file_id_1, body.file_id_2)

    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])

    return {"success": True, "result": result}