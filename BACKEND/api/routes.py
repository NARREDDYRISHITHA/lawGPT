"""
API routes for the LawGPT application.
"""
from fastapi import APIRouter
from models.question import QuestionRequest, QuestionResponse
from services.llm_service import get_llm_response
from utils.helpers import print_colored

# Create router
router = APIRouter()


@router.post("/api/ask", response_model=QuestionResponse)
async def ask_question(req: QuestionRequest):
    """
    Process a question and return an answer
    
    Args:
        req (QuestionRequest): The question request
    
    Returns:
        dict: The answer response
    """
    from main import retriever  # Import here to avoid circular imports
    
    # Log the question
    print_colored(f"Received question: {req.question}", "blue")
    
    # Get answer from LLM service
    answer = get_llm_response(req.question, retriever)
    
    # Return response
    return QuestionResponse(answer=answer)


@router.get("/health")
async def health_check():
    """
    Simple health check endpoint
    
    Returns:
        dict: Status information
    """
    return {"status": "ok", "service": "LawGPT API"}