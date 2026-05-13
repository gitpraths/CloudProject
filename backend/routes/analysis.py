from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import get_submissions_by_assignment
from services.plagiarism_service import run_plagiarism_check

router = APIRouter()

class AnalyzeRequest(BaseModel):
    assignment: str

@router.post("/plagiarism-matrix")
async def plagiarism_matrix(body: AnalyzeRequest):
    submissions = get_submissions_by_assignment(body.assignment)
    
    if len(submissions) < 2:
        raise HTTPException(status_code=400, detail="Need at least 2 submissions to compare")
    
    results = []
    flagged = []
    
    for i in range(len(submissions)):
        for j in range(i + 1, len(submissions)):
            s1 = submissions[i]
            s2 = submissions[j]
            
            comparison = run_plagiarism_check(s1["file_id"], s2["file_id"])
            score = comparison.get("similarity_score", 0)
            
            pair = {
                "student_a": s1["student_id"],
                "student_b": s2["student_id"],
                "file_id_1": s1["file_id"],
                "file_id_2": s2["file_id"],
                "similarity_score": score,
                "is_flagged": score > 0.7
            }
            results.append(pair)
            
            if score > 0.7:
                flagged.append(pair)
    
    return {
        "success": True,
        "assignment": body.assignment,
        "total_pairs": len(results),
        "flagged_count": len(flagged),
        "pairs": results,
        "flagged_pairs": flagged
    }