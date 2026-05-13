from pydantic import BaseModel, Field
from typing import List, Optional


class Bug(BaseModel):
    line: Optional[int] = None
    description: str


class ReviewResponse(BaseModel):
    bugs: List[Bug] = Field(default_factory=list)
    code_smells: List[str] = Field(default_factory=list)
    suggestions: List[str] = Field(default_factory=list)
    complexity_rating: int = Field(default=0, ge=0, le=10)
    overall_score: int = Field(default=0, ge=0, le=100)


class ReviewResult(BaseModel):
    submission_id: str
    filename: Optional[str] = None
    review: ReviewResponse
    status: str = "success"


class DirectReviewRequest(BaseModel):
    code: str = Field(..., description="Source code to review")
    filename: Optional[str] = Field(default="code.py", description="Filename hint for language detection")


class ErrorResponse(BaseModel):
    status: str = "error"
    message: str
