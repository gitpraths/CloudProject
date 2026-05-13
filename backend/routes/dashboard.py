from fastapi import APIRouter
from database import get_connection

router = APIRouter()


@router.get("/stats")
async def get_dashboard_stats():
    """
    Get dashboard statistics.
    """
    conn = get_connection()
    
    # Total submissions
    total_submissions = conn.execute("SELECT COUNT(*) as count FROM submissions").fetchone()["count"]
    
    # Active assignments (assignments with submissions in last 30 days)
    active_assignments = conn.execute("""
        SELECT COUNT(DISTINCT assignment) as count 
        FROM submissions 
        WHERE datetime(uploaded_at) > datetime('now', '-30 days')
    """).fetchone()["count"]
    
    # Flagged submissions
    flagged_count = conn.execute("""
        SELECT COUNT(*) as count 
        FROM submissions 
        WHERE status = 'flagged'
    """).fetchone()["count"]
    
    # Recent submissions
    recent_submissions = conn.execute("""
        SELECT * FROM submissions 
        ORDER BY uploaded_at DESC 
        LIMIT 10
    """).fetchall()
    
    conn.close()
    
    return {
        "success": True,
        "stats": {
            "total_submissions": total_submissions,
            "active_assignments": active_assignments,
            "flagged_pairs": flagged_count
        },
        "recent_submissions": [dict(row) for row in recent_submissions]
    }
