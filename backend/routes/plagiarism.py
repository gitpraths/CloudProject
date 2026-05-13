from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.plagiarism_service import run_plagiarism_check, analyze_assignment_plagiarism

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


@router.get("/analyze/{assignment_id}")
async def analyze_assignment(assignment_id: str):
    """
    Analyze all submissions for an assignment for plagiarism.
    
    Returns similarity matrix and flagged pairs for the frontend.
    
    Example response:
    {
        "success": true,
        "assignment_id": "lab1",
        "similarity_matrix": {
            "student_001": {"student_001": 0, "student_002": 95, ...},
            ...
        },
        "flagged_pairs": [
            {
                "id": "1",
                "studentA": "student_001",
                "studentB": "student_002",
                "similarity": 95,
                "filesMatched": 1
            }
        ],
        "statistics": {...},
        "total_submissions": 10
    }
    """
    result = analyze_assignment_plagiarism(assignment_id)
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return {"success": True, **result}