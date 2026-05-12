import os
import uuid
from pathlib import Path

UPLOAD_DIR = Path("uploads")

ALLOWED_EXTENSIONS = {".py", ".js", ".ts", ".java", ".c", ".cpp", ".cs", ".go", ".rb", ".php"}


def ensure_upload_dir():
    """Create uploads/ directory if it doesn't exist."""
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def is_allowed_file(filename: str) -> bool:
    return Path(filename).suffix.lower() in ALLOWED_EXTENSIONS


def generate_file_id() -> str:
    return str(uuid.uuid4())


def save_file(file_id: str, filename: str, content: bytes) -> Path:
    """Save raw bytes to uploads/<file_id>_<filename> and return the path."""
    safe_name = f"{file_id}_{filename}"
    dest = UPLOAD_DIR / safe_name
    dest.write_bytes(content)
    return dest


def read_file(file_path: str) -> str:
    """Read a file from disk and return its text content."""
    return Path(file_path).read_text(encoding="utf-8", errors="replace")


def list_uploaded_files() -> list[dict]:
    """Return metadata for every file currently in uploads/."""
    files = []
    for f in sorted(UPLOAD_DIR.iterdir()):
        if f.is_file():
            # The stored name is  <uuid>_<original_name>
            parts = f.name.split("_", 1)
            files.append({
                "file_id": parts[0] if len(parts) == 2 else f.name,
                "filename": parts[1] if len(parts) == 2 else f.name,
                "size_bytes": f.stat().st_size,
                "path": str(f),
            })
    return files