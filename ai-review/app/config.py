import os
from dotenv import load_dotenv

load_dotenv()

PROJECT_ID = os.getenv("PROJECT_ID", "your-gcp-project-id")
LOCATION = os.getenv("LOCATION", "us-central1")
BUCKET_NAME = os.getenv("BUCKET_NAME", "your-gcs-bucket-name")
MODEL_NAME = os.getenv("MODEL_NAME", "gemini-1.5-flash")
BIGQUERY_DATASET = os.getenv("BIGQUERY_DATASET", "code_review")
BIGQUERY_TABLE = os.getenv("BIGQUERY_TABLE", "reviews")
