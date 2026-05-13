import vertexai
from vertexai.generative_models import GenerativeModel, GenerationConfig
import os

PROJECT_ID = os.getenv("PROJECT_ID", "your-gcp-project-id")
LOCATION = os.getenv("LOCATION", "us-central1")
MODEL_NAME = os.getenv("MODEL_NAME", "gemini-1.5-flash")

# Initialize Vertex AI once when module is loaded
vertexai.init(project=PROJECT_ID, location=LOCATION)

model = GenerativeModel(MODEL_NAME)

# Tell Gemini to respond with JSON
generation_config = GenerationConfig(
    temperature=0.2,       # Low temp = more consistent, deterministic output
    max_output_tokens=2048,
    response_mime_type="application/json",  # Forces JSON output (Gemini 1.5+)
)


def call_gemini(prompt: str) -> str:
    """
    Send a prompt to Gemini and return the raw response text.
    Raises an exception if the API call fails.
    """
    response = model.generate_content(
        prompt,
        generation_config=generation_config,
    )
    return response.text
