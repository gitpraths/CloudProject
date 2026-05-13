import vertexai
from vertexai.generative_models import GenerativeModel, GenerationConfig
from app.config import PROJECT_ID, LOCATION, MODEL_NAME

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
