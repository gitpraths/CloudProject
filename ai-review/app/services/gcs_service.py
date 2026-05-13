from google.cloud import storage
from fastapi import HTTPException
from app.config import BUCKET_NAME


def fetch_code_from_gcs(submission_id: str) -> tuple[str, str]:
    """
    Fetch the submitted code file from GCS using the submission_id.

    Expects files stored at:  submissions/{submission_id}/{filename}

    Returns:
        (code_text, filename)

    Raises:
        HTTPException 404 if no file found for that submission_id.
    """
    client = storage.Client()
    bucket = client.bucket(BUCKET_NAME)

    # List all blobs under the submission prefix
    prefix = f"submissions/{submission_id}/"
    blobs = list(bucket.list_blobs(prefix=prefix))

    if not blobs:
        raise HTTPException(
            status_code=404,
            detail=f"No files found for submission_id '{submission_id}' in bucket '{BUCKET_NAME}'"
        )

    # Take the first file found (there should typically be one per submission)
    blob = blobs[0]
    filename = blob.name.split("/")[-1]

    try:
        content = blob.download_as_text(encoding="utf-8")
    except Exception:
        # Fallback for binary or non-UTF-8 files
        content = blob.download_as_bytes().decode("utf-8", errors="replace")

    return content, filename


def upload_code_to_gcs(submission_id: str, filename: str, code: str) -> str:
    """
    Helper used in testing: upload code text to GCS under the expected path.
    Returns the GCS URI.
    """
    client = storage.Client()
    bucket = client.bucket(BUCKET_NAME)
    blob = bucket.blob(f"submissions/{submission_id}/{filename}")
    blob.upload_from_string(code, content_type="text/plain")
    return f"gs://{BUCKET_NAME}/submissions/{submission_id}/{filename}"
