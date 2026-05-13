from fastapi import APIRouter, HTTPException
from app.models.review_schema import ReviewResult, DirectReviewRequest, ErrorResponse
from app.services.vertex_service import call_gemini
from app.services.prompt_service import build_review_prompt
from app.services.parser_service import parse_review_response
from app.services.gcs_service import fetch_code_from_gcs
from app.services.bigquery_service import store_review_result

router = APIRouter()


# ─────────────────────────────────────────────
# ROUTE 1: Review by submission_id (GCS-backed)
# This is the main production route.
# The backend/frontend calls this after a student uploads code.
# ─────────────────────────────────────────────
@router.get(
    "/review/{submission_id}",
    response_model=ReviewResult,
    summary="Review code by submission ID",
    description="Fetches the uploaded code from GCS and returns an AI-generated review.",
)
async def review_by_submission_id(submission_id: str):
    # Step 1: Fetch code from Google Cloud Storage
    try:
        code, filename = fetch_code_from_gcs(submission_id)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch code from GCS: {str(e)}")

    # Step 2: Build the Gemini prompt
    prompt = build_review_prompt(code, filename)

    # Step 3: Call Vertex AI Gemini
    try:
        raw_response = call_gemini(prompt)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Vertex AI call failed: {str(e)}")

    # Step 4: Parse and validate the JSON response
    review = parse_review_response(raw_response)

    # Step 5: Store result in BigQuery (best-effort, won't break response if it fails)
    store_review_result(submission_id, filename, review)

    # Step 6: Return structured response
    return ReviewResult(
        submission_id=submission_id,
        filename=filename,
        review=review,
        status="success",
    )


# ─────────────────────────────────────────────
# ROUTE 2: Direct code review (no GCS needed)
# Useful for testing, demos, and direct frontend input.
# ─────────────────────────────────────────────
@router.post(
    "/review/direct",
    response_model=ReviewResult,
    summary="Review code directly (paste code)",
    description="Send raw code in the request body and get an AI review. No GCS required.",
)
async def review_direct(request: DirectReviewRequest):
    if not request.code.strip():
        raise HTTPException(status_code=400, detail="Code cannot be empty.")

    # Build prompt
    prompt = build_review_prompt(request.code, request.filename or "code.py")

    # Call Gemini
    try:
        raw_response = call_gemini(prompt)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Vertex AI call failed: {str(e)}")

    # Parse response
    review = parse_review_response(raw_response)

    return ReviewResult(
        submission_id="direct",
        filename=request.filename or "code.py",
        review=review,
        status="success",
    )


# ─────────────────────────────────────────────
# ROUTE 3: Health check for this router
# ─────────────────────────────────────────────
@router.get("/review/health", summary="AI Review service health check")
async def review_health():
    return {"service": "ai-review", "status": "ok"}
