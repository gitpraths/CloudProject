from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from utils.file_utils import is_allowed_file, generate_file_id, save_file
from database import save_submission, get_all_submissions

router = APIRouter()
MAX_FILE_SIZE = 1 * 1024 * 1024

@router.post("/")
async def upload_file(
    file: UploadFile = File(...),
    student_id: str = Form(default="unknown"),
    assignment: str = Form(default="unknown"),
):
    if not is_allowed_file(file.filename):
        raise HTTPException(status_code=400, detail="File type not supported.")

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large.")

    file_id = generate_file_id()
    save_file(file_id, file.filename, content)
    save_submission(student_id, assignment, file.filename, file_id)

    return {
        "success": True,
        "file_id": file_id,
        "filename": file.filename,
        "size_bytes": len(content),
        "message": "File uploaded successfully.",
    }

@router.get("/list")
async def list_files():
    submissions = get_all_submissions()
    return {
        "success": True,
        "count": len(submissions),
        "submissions": submissions,
    }