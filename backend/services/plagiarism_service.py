"""
services/plagiarism_service.py
================================
Thin service layer that:
1. Resolves file_ids → actual file paths on disk.
2. Reads the file contents.
3. Calls the plagiarism module (plagiarism.py).
4. Returns the result dict.

Keeping this separate from the route means the route stays clean and the
logic is easy to swap without touching the API contract.
"""

from pathlib import Path
from utils.file_utils import UPLOAD_DIR, read_file
import plagiarism as plagiarism_module


def resolve_path(file_id: str) -> Path:
    """Find the file in uploads/ that starts with the given file_id prefix."""
    matches = list(UPLOAD_DIR.glob(f"{file_id}_*"))
    if not matches:
        return None
    return matches[0]


def run_plagiarism_check(file_id_1: str, file_id_2: str) -> dict:
    path1 = resolve_path(file_id_1)
    path2 = resolve_path(file_id_2)

    missing = []
    if path1 is None:
        missing.append(file_id_1)
    if path2 is None:
        missing.append(file_id_2)
    if missing:
        return {"error": f"File(s) not found: {', '.join(missing)}"}

    content1 = read_file(str(path1))
    content2 = read_file(str(path2))

    result = plagiarism_module.detect_plagiarism(content1, content2)

    # Attach file metadata for the frontend to display
    result["file1"] = {"file_id": file_id_1, "filename": path1.name.split("_", 1)[1]}
    result["file2"] = {"file_id": file_id_2, "filename": path2.name.split("_", 1)[1]}

    return result