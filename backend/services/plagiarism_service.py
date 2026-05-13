"""
services/plagiarism_service.py
================================
Service layer for plagiarism detection using the plagiarism_engine.

This service:
1. Fetches all submissions for an assignment from the database
2. Reads file contents from disk
3. Runs the plagiarism engine to analyze all submissions
4. Returns similarity matrix and flagged pairs for the frontend
5. Provides detailed comparison with highlighted matching lines
"""

import sys
from pathlib import Path
from difflib import SequenceMatcher

# Add plagiarism_engine to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / 'plagiarism_engine'))

from plagiarism_engine import PlagiarismEngine
from utils.file_utils import UPLOAD_DIR, read_file
from database import get_submissions_by_assignment


# Initialize engine once
engine = PlagiarismEngine(threshold=0.80)


def resolve_path(file_id: str) -> Path:
    """Find the file in uploads/ that starts with the given file_id prefix."""
    matches = list(UPLOAD_DIR.glob(f"{file_id}_*"))
    if not matches:
        return None
    return matches[0]


def find_matching_lines(code_a: str, code_b: str, similarity_threshold: float = 0.6) -> tuple:
    """
    Find matching lines between two code files.
    
    Returns:
        (matched_lines_a, matched_lines_b) - Sets of line numbers that match
    """
    lines_a = code_a.split('\n')
    lines_b = code_b.split('\n')
    
    matched_a = set()
    matched_b = set()
    
    # Use SequenceMatcher to find similar blocks
    matcher = SequenceMatcher(None, lines_a, lines_b)
    
    for match in matcher.get_matching_blocks():
        i, j, size = match
        if size > 0:  # Only consider actual matches
            # Add line numbers (1-indexed)
            for offset in range(size):
                matched_a.add(i + offset + 1)
                matched_b.add(j + offset + 1)
    
    return matched_a, matched_b


def get_detailed_comparison(file_id_1: str, file_id_2: str) -> dict:
    """
    Get detailed side-by-side comparison with highlighted matching lines.
    
    Returns:
    {
        "studentA": str,
        "studentB": str,
        "similarity": int (0-100),
        "codeA": [
            {"lineNumber": 1, "content": "...", "isMatched": bool},
            ...
        ],
        "codeB": [...],
        "fileA": {"name": str, "path": str},
        "fileB": {"name": str, "path": str}
    }
    """
    path1 = resolve_path(file_id_1)
    path2 = resolve_path(file_id_2)

    if path1 is None or path2 is None:
        return {"error": "File(s) not found"}

    # Read file contents
    content1 = read_file(str(path1))
    content2 = read_file(str(path2))
    
    # Get similarity score from engine
    result = engine.compare_two_submissions(
        code_a=content1,
        code_b=content2,
        filename_a=path1.name,
        filename_b=path2.name
    )
    
    # Find matching lines
    matched_lines_a, matched_lines_b = find_matching_lines(content1, content2)
    
    # Format code with line numbers and match flags
    lines_a = content1.split('\n')
    lines_b = content2.split('\n')
    
    code_a_formatted = [
        {
            "lineNumber": i + 1,
            "content": line,
            "isMatched": (i + 1) in matched_lines_a
        }
        for i, line in enumerate(lines_a)
    ]
    
    code_b_formatted = [
        {
            "lineNumber": i + 1,
            "content": line,
            "isMatched": (i + 1) in matched_lines_b
        }
        for i, line in enumerate(lines_b)
    ]
    
    return {
        "studentA": file_id_1,
        "studentB": file_id_2,
        "similarity": int(result['similarity_score'] * 100),
        "codeA": code_a_formatted,
        "codeB": code_b_formatted,
        "fileA": {
            "name": path1.name.split("_", 1)[1] if "_" in path1.name else path1.name,
            "path": str(path1)
        },
        "fileB": {
            "name": path2.name.split("_", 1)[1] if "_" in path2.name else path2.name,
            "path": str(path2)
        }
    }


def analyze_assignment_plagiarism(assignment_id: str) -> dict:
    """
    Analyze all submissions for an assignment for plagiarism.
    
    Returns:
    {
        "assignment_id": str,
        "similarity_matrix": {
            "student_001": {"student_001": 0, "student_002": 95, ...},
            ...
        },
        "flagged_pairs": [
            {
                "id": str,
                "studentA": str,
                "studentB": str,
                "similarity": int (0-100),
                "filesMatched": int
            }
        ],
        "statistics": {...}
    }
    """
    # Get all submissions for this assignment
    db_submissions = get_submissions_by_assignment(assignment_id)
    
    if len(db_submissions) < 2:
        return {
            "error": "Need at least 2 submissions to analyze",
            "assignment_id": assignment_id,
            "similarity_matrix": {},
            "flagged_pairs": [],
            "statistics": {}
        }
    
    # Prepare submissions for the engine
    engine_submissions = []
    student_map = {}  # Map submission_id to student_id
    
    for sub in db_submissions:
        file_path = resolve_path(sub['file_id'])
        if file_path is None:
            continue
        
        try:
            code = read_file(str(file_path))
            engine_submissions.append({
                'id': sub['file_id'],
                'student_id': sub['student_id'],
                'code': code,
                'filename': sub['filename']
            })
            student_map[sub['file_id']] = sub['student_id']
        except Exception as e:
            print(f"Error reading file {sub['file_id']}: {e}")
            continue
    
    if len(engine_submissions) < 2:
        return {
            "error": "Not enough valid submissions after reading files",
            "assignment_id": assignment_id,
            "similarity_matrix": {},
            "flagged_pairs": [],
            "statistics": {}
        }
    
    # Run plagiarism engine
    results = engine.analyze_submissions(engine_submissions, assignment_id=assignment_id)
    
    if 'error' in results:
        return {
            "error": results['error'],
            "assignment_id": assignment_id,
            "similarity_matrix": {},
            "flagged_pairs": [],
            "statistics": {}
        }
    
    # Convert similarity matrix to frontend format
    # Frontend expects: { "STU-001": { "STU-001": 0, "STU-002": 15, ... }, ... }
    similarity_matrix_frontend = {}
    student_ids = results['student_ids']
    matrix = results['similarity_matrix']
    
    for i, student_a in enumerate(student_ids):
        similarity_matrix_frontend[student_a] = {}
        for j, student_b in enumerate(student_ids):
            # Convert 0.0-1.0 to 0-100 for frontend
            similarity_matrix_frontend[student_a][student_b] = int(matrix[i][j] * 100)
    
    # Convert flagged pairs to frontend format
    flagged_pairs_frontend = []
    for idx, pair in enumerate(results['flagged_pairs']):
        flagged_pairs_frontend.append({
            'id': str(idx + 1),
            'studentA': pair['student_a'],
            'studentB': pair['student_b'],
            'similarity': int(pair['similarity_score'] * 100),  # Convert to 0-100
            'filesMatched': 1  # For now, assume 1 file per submission
        })
    
    return {
        "assignment_id": assignment_id,
        "similarity_matrix": similarity_matrix_frontend,
        "flagged_pairs": flagged_pairs_frontend,
        "statistics": results['statistics'],
        "total_submissions": results['total_submissions']
    }


def run_plagiarism_check(file_id_1: str, file_id_2: str) -> dict:
    """
    Compare two specific submissions (for backward compatibility).
    
    Returns:
    {
        "similarity_score": float (0.0-1.0),
        "is_plagiarised": bool,
        "file1": {...},
        "file2": {...}
    }
    """
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
    
    # Use engine to compare
    result = engine.compare_two_submissions(
        code_a=content1,
        code_b=content2,
        filename_a=path1.name,
        filename_b=path2.name
    )

    # Attach file metadata for the frontend
    return {
        "similarity_score": result['similarity_score'],
        "is_plagiarised": result['flagged'],
        "file1": {"file_id": file_id_1, "filename": path1.name.split("_", 1)[1]},
        "file2": {"file_id": file_id_2, "filename": path2.name.split("_", 1)[1]},
        "method": "AST + TF-IDF + Cosine Similarity"
    }
