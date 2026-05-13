from fastapi import APIRouter, UploadFile, File, HTTPException
from utils.file_utils import (
    is_allowed_file,
    generate_file_id,
    save_file,
    list_uploaded_files,
)

router = APIRouter()

MAX_FILE_SIZE = 1 * 1024 * 1024  # 1 MB — reasonable for source code files


@router.post("/")
async def upload_file(file: UploadFile = File(...)):
    """
    Upload a single code file.

    Returns the assigned file_id which the frontend uses in subsequent
    /plagiarism and /review calls.

    Accepted extensions: .py .js .ts .java .c .cpp .cs .go .rb .php
    """
    if not is_allowed_file(file.filename):
        raise HTTPException(
            status_code=400,
            detail=f"File type not supported. Allowed: .py .js .ts .java .c .cpp .cs .go .rb .php",
        )

    content = await file.read()

    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 1 MB.")

    file_id = generate_file_id()
    path = save_file(file_id, file.filename, content)

    return {
        "success": True,
        "file_id": file_id,
        "filename": file.filename,
        "size_bytes": len(content),
        "message": "File uploaded successfully.",
    }


@router.get("/list")
async def list_files():
    """
    List all uploaded files.
    Useful for the instructor dashboard to populate file selectors.
    """
    files = list_uploaded_files()
    return {
        "success": True,
        "count": len(files),
        "files": files,
    }