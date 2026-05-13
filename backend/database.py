import sqlite3
from datetime import datetime
from pathlib import Path

DB_PATH = Path("submissions.db")

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS submissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id TEXT NOT NULL,
            assignment TEXT NOT NULL,
            filename TEXT NOT NULL,
            file_id TEXT NOT NULL,
            status TEXT DEFAULT 'uploaded',
            ai_score INTEGER DEFAULT 0,
            uploaded_at TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()

def get_submissions_by_assignment(assignment: str):
    conn = get_connection()
    rows = conn.execute(
        "SELECT * FROM submissions WHERE assignment = ? ORDER BY uploaded_at DESC",
        (assignment,)
    ).fetchall()
    conn.close()
    return [dict(row) for row in rows]

def save_submission(student_id, assignment, filename, file_id):
    conn = get_connection()
    conn.execute("""
        INSERT INTO submissions 
        (student_id, assignment, filename, file_id, status, uploaded_at)
        VALUES (?, ?, ?, ?, 'uploaded', ?)
    """, (student_id, assignment, filename, file_id, datetime.now().isoformat()))
    conn.commit()
    conn.close()

def get_all_submissions():
    conn = get_connection()
    rows = conn.execute(
        "SELECT * FROM submissions ORDER BY uploaded_at DESC"
    ).fetchall()
    conn.close()
    return [dict(row) for row in rows]

def update_submission_status(file_id, status, ai_score=None):
    conn = get_connection()
    if ai_score:
        conn.execute(
            "UPDATE submissions SET status=?, ai_score=? WHERE file_id=?",
            (status, ai_score, file_id)
        )
    else:
        conn.execute(
            "UPDATE submissions SET status=? WHERE file_id=?",
            (status, file_id)
        )
    conn.commit()
    conn.close()