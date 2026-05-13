from fastapi import APIRouter
from database import get_connection

router = APIRouter()


@router.get("/")
async def get_all_assignments():
    """
    Get all unique assignments with their statistics.
    
    Returns a list of assignments with submission counts, flagged counts, etc.
    """
    conn = get_connection()
    
    # Get all unique assignments with stats
    query = """
        SELECT 
            assignment as id,
            assignment as name,
            COUNT(*) as submissions,
            COUNT(DISTINCT student_id) as unique_students,
            AVG(CASE WHEN ai_score > 0 THEN ai_score ELSE NULL END) as avg_score,
            MAX(uploaded_at) as last_submission
        FROM submissions
        GROUP BY assignment
        ORDER BY last_submission DESC
    """
    
    rows = conn.execute(query).fetchall()
    conn.close()
    
    assignments = []
    for row in rows:
        # For now, we'll set flagged count to 0 - we can calculate this from plagiarism results later
        assignments.append({
            "id": row["id"],
            "name": row["name"],
            "status": "active",  # Default status
            "submissions": row["submissions"],
            "flagged": 0,  # TODO: Calculate from plagiarism results
            "deadline": "",  # TODO: Add deadline field to database
            "avgScore": int(row["avg_score"]) if row["avg_score"] else 0
        })
    
    return {
        "success": True,
        "assignments": assignments
    }


@router.get("/{assignment_id}")
async def get_assignment_details(assignment_id: str):
    """
    Get details for a specific assignment including all submissions.
    """
    conn = get_connection()
    
    # Get assignment stats
    stats_query = """
        SELECT 
            COUNT(*) as total_submissions,
            COUNT(DISTINCT student_id) as unique_students,
            AVG(CASE WHEN ai_score > 0 THEN ai_score ELSE NULL END) as avg_score
        FROM submissions
        WHERE assignment = ?
    """
    
    stats = conn.execute(stats_query, (assignment_id,)).fetchone()
    
    # Get all submissions for this assignment
    submissions_query = """
        SELECT *
        FROM submissions
        WHERE assignment = ?
        ORDER BY uploaded_at DESC
    """
    
    submissions = conn.execute(submissions_query, (assignment_id,)).fetchall()
    conn.close()
    
    return {
        "success": True,
        "assignment": {
            "id": assignment_id,
            "name": assignment_id,
            "total_submissions": stats["total_submissions"],
            "unique_students": stats["unique_students"],
            "avg_score": int(stats["avg_score"]) if stats["avg_score"] else 0
        },
        "submissions": [dict(row) for row in submissions]
    }
