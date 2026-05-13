"""
services/review_service.py
===========================
Thin service layer that:
1. Resolves file_id → file path on disk.
2. Reads the file content.
3. Detects the programming language from the file extension.
4. Calls the AI review module (ai_review.py).
5. Returns the result dict.
"""

from pathlib import Path
from utils.file_utils import UPLOAD_DIR, read_file
import ai_review as ai_review_module

EXTENSION_LANGUAGE_MAP = {
    ".py": "python",
    ".js": "javascript",
    ".ts": "typescript",
    ".java": "java",
    ".c": "c",
    ".cpp": "cpp",
    ".cs": "csharp",
    ".go": "go",
    ".rb": "ruby",
    ".php": "php",
}


def resolve_path(file_id: str) -> Path:
    matches = list(UPLOAD_DIR.glob(f"{file_id}_*"))
    if not matches:
        return None
    return matches[0]


def run_ai_review(file_id: str) -> dict:
    path = resolve_path(file_id)
    if path is None:
        return {"error": f"File not found: {file_id}"}

    content = read_file(str(path))
    extension = path.suffix.lower()
    language = EXTENSION_LANGUAGE_MAP.get(extension, "unknown")

    result = ai_review_module.review_code(content, language)

    # Attach file metadata for the frontend
    result["file"] = {
        "file_id": file_id,
        "filename": path.name.split("_", 1)[1],
        "language": language,
    }

    return result