"""
services/review_service.py
===========================
AI-powered code review service using Vertex AI (Gemini).
"""

from pathlib import Path
from utils.file_utils import UPLOAD_DIR, read_file
from services.vertex_service import call_gemini
from services.prompt_service import build_review_prompt
from services.parser_service import parse_review_response


def resolve_path(file_id: str) -> Path:
    matches = list(UPLOAD_DIR.glob(f"{file_id}_*"))
    if not matches:
        return None
    return matches[0]


def run_ai_review(file_id: str) -> dict:
    """
    Run AI code review on an uploaded file.
    
    Returns:
    {
        "bugs": [...],
        "code_smells": [...],
        "suggestions": [...],
        "complexity_rating": int,
        "overall_score": int,
        "file": {...}
    }
    """
    path = resolve_path(file_id)
    if path is None:
        return {"error": f"File not found: {file_id}"}

    content = read_file(str(path))
    filename = path.name.split("_", 1)[1] if "_" in path.name else path.name

    # Build prompt
    prompt = build_review_prompt(content, filename)
    
    # Call Gemini
    try:
        raw_response = call_gemini(prompt)
        review = parse_review_response(raw_response)
        
        result = review.dict()
        result["file"] = {
            "file_id": file_id,
            "filename": filename,
        }
        
        return result
    except Exception as e:
        return {
            "error": f"AI review failed: {str(e)}",
            "file": {
                "file_id": file_id,
                "filename": filename,
            }
        }
