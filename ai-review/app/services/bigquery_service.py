import json
from datetime import datetime, timezone
from google.cloud import bigquery
from app.config import PROJECT_ID, BIGQUERY_DATASET, BIGQUERY_TABLE
from app.models.review_schema import ReviewResponse


def store_review_result(submission_id: str, filename: str, review: ReviewResponse) -> bool:
    """
    Store a completed review into BigQuery for history and analytics.

    Table schema expected:
        submission_id   STRING
        filename        STRING
        overall_score   INTEGER
        complexity      INTEGER
        bug_count       INTEGER
        smell_count     INTEGER
        suggestion_count INTEGER
        review_json     STRING (full JSON blob)
        reviewed_at     TIMESTAMP
    """
    try:
        client = bigquery.Client(project=PROJECT_ID)
        table_ref = f"{PROJECT_ID}.{BIGQUERY_DATASET}.{BIGQUERY_TABLE}"

        row = {
            "submission_id": submission_id,
            "filename": filename,
            "overall_score": review.overall_score,
            "complexity": review.complexity_rating,
            "bug_count": len(review.bugs),
            "smell_count": len(review.code_smells),
            "suggestion_count": len(review.suggestions),
            "review_json": json.dumps(review.model_dump()),
            "reviewed_at": datetime.now(timezone.utc).isoformat(),
        }

        errors = client.insert_rows_json(table_ref, [row])

        if errors:
            print(f"[BigQuery] Insert errors: {errors}")
            return False

        return True

    except Exception as e:
        # BigQuery storage is optional — never let it break the main response
        print(f"[BigQuery] Failed to store review: {e}")
        return False


def get_review_history(submission_id: str) -> list:
    """
    Retrieve past reviews for a submission from BigQuery.
    """
    try:
        client = bigquery.Client(project=PROJECT_ID)
        query = f"""
            SELECT *
            FROM `{PROJECT_ID}.{BIGQUERY_DATASET}.{BIGQUERY_TABLE}`
            WHERE submission_id = @submission_id
            ORDER BY reviewed_at DESC
            LIMIT 10
        """
        job_config = bigquery.QueryJobConfig(
            query_parameters=[
                bigquery.ScalarQueryParameter("submission_id", "STRING", submission_id)
            ]
        )
        result = client.query(query, job_config=job_config).result()
        return [dict(row) for row in result]

    except Exception as e:
        print(f"[BigQuery] Failed to fetch history: {e}")
        return []
