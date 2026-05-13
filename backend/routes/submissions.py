from fastapi import APIRouter
from database import get_all_submissions

router = APIRouter()

@router.get("/")
async def all_submissions():
    data = get_all_submissions()
    return {
        "success": True,
        "count": len(data),
        "submissions": data
    }