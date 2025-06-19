"""
Model definitions for the LawGPT application.
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class QuestionRequest(BaseModel):
    """Model for question request from client."""
    question: str = Field(..., description="The legal question to be answered")


class QuestionResponse(BaseModel):
    """Model for response to client questions."""
    answer: str = Field(..., description="The answer to the question")
    sources: Optional[List[Dict[str, Any]]] = Field(None, description="Source documents used to generate the answer")
    query_type: Optional[str] = Field(None, description="Type of question detected")