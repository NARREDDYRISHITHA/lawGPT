"""
LLM service for LawGPT application.
"""
import pickle
import os
import re
from typing import Dict, List, Optional, Any
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.prompts import ChatPromptTemplate
from langchain.schema import HumanMessage, SystemMessage
from config.settings import (
    GOOGLE_API_KEY, LLM_MODEL, TEMPERATURE, MAX_TOKENS,
    CHUNK_SIZE, CHUNK_OVERLAP, HISTORY_FILE
)
from services.vector_store import get_retriever
from utils.helpers import print_colored


# Global variable to store conversation history
conversation_history = []


def save_history():
    """Save conversation history to file"""
    with open(HISTORY_FILE, "wb") as f:
        pickle.dump(conversation_history, f)


def load_history():
    """Load conversation history from file"""
    global conversation_history
    if os.path.exists(HISTORY_FILE):
        try:
            with open(HISTORY_FILE, "rb") as f:
                conversation_history = pickle.load(f)
        except Exception as e:
            print_colored(f"Error loading history: {e}", "red")
            conversation_history = []


# Load history at module initialization
load_history()


# Initialize LLM
llm = ChatGoogleGenerativeAI(
    model=LLM_MODEL,
    temperature=TEMPERATURE,
    max_output_tokens=MAX_TOKENS,
    google_api_key=GOOGLE_API_KEY
)


def is_legal_question(question: str) -> bool:
    """
    Determine if the question is legal-related.
    
    Args:
        question (str): The user's question
        
    Returns:
        bool: True if the question is legal-related, False otherwise
    """
    legal_keywords = [
        "law", "legal", "court", "judge", "case", "ruling", "judgment",
        "section", "article", "clause", "provision", "statute", "act",
        "constitution", "rights", "duty", "obligation", "contract",
        "agreement", "property", "criminal", "civil", "jurisdiction",
        "appeal", "petition", "writ", "order", "decree", "verdict"
    ]
    
    question_lower = question.lower()
    return any(keyword in question_lower for keyword in legal_keywords)


def format_bold_text(text: str) -> str:
    """
    Format text with ** markers as bold text.
    
    Args:
        text (str): Text containing ** markers
        
    Returns:
        str: Formatted text with bold markers
    """
    return re.sub(r'\*\*(.*?)\*\*', r'🔹\1🔹', text)


def determine_response_style(question: str) -> str:
    """
    Determine the style of response based on the question type.
    
    Args:
        question (str): The user's question
        
    Returns:
        str: The determined response style
    """
    if not is_legal_question(question):
        return "general"
        
    question = question.lower()
    
    if any(word in question for word in ["summarize", "summary", "overview", "brief"]):
        return "summary"
    elif any(word in question for word in ["list", "enumerate", "what are", "what is"]):
        return "list"
    elif any(word in question for word in ["compare", "difference", "versus", "vs"]):
        return "comparison"
    elif any(word in question for word in ["explain", "how does", "why does"]):
        return "explanation"
    elif any(word in question for word in ["define", "what is the meaning", "what does"]):
        return "definition"
    elif any(word in question for word in ["case", "ruling", "judgment", "verdict"]):
        return "case_ruling"
    elif any(word in question for word in ["section", "article", "clause", "provision"]):
        return "legal_reference"
    elif any(word in question for word in ["court", "judge", "bench", "judicial"]):
        return "court_composition"
    else:
        return "legal_general"


def format_legal_sections(response_text: str) -> Dict[str, str]:
    """
    Format the response text into structured legal sections.
    
    Args:
        response_text (str): The raw response text
        
    Returns:
        Dict[str, str]: Dictionary containing formatted sections
    """
    # Split the response into sections
    sections = response_text.split("\n\n")
    
    # Initialize sections dictionary
    formatted_sections = {
        "title": "📌 Title",
        "section": "📜 Legal Section",
        "analyze": "🔍 Analysis",
        "description": "📝 Description",
        "implications": "⚖️ Legal Implications",
        "references": "📚 References",
        "conclusion": "🎯 Conclusion"
    }
    
    # Map sections to their content
    for i, section in enumerate(sections):
        if i == 0:
            formatted_sections["title"] = f"📌 Title\n{section}"
        elif i == 1:
            formatted_sections["section"] = f"📜 Legal Section\n{section}"
        elif i == 2:
            formatted_sections["analyze"] = f"🔍 Analysis\n{section}"
        elif i == 3:
            formatted_sections["description"] = f"📝 Description\n{section}"
        elif i == 4:
            formatted_sections["implications"] = f"⚖️ Legal Implications\n{section}"
        elif i == 5:
            formatted_sections["references"] = f"📚 References\n{section}"
        elif i == 6:
            formatted_sections["conclusion"] = f"🎯 Conclusion\n{section}"
    
    return formatted_sections


def format_response_with_sections(response_text: str, style: str) -> str:
    """
    Format the response text into sections with enhanced visual styling.
    
    Args:
        response_text (str): The raw response text
        style (str): The response style
        
    Returns:
        str: Formatted response with sections
    """
    # Format any bold text in the response
    response_text = format_bold_text(response_text)
    
    # For general (non-legal) responses
    if style == "general":
        return f"\n👋 Response 👋\n{response_text}\n"
    
    # For legal responses, use structured sections
    if is_legal_question(response_text):
        sections = format_legal_sections(response_text)
        
        # Create the formatted response
        separator = "═" * 50 + "\n"
        formatted_response = "\n" + separator
        
        # Add each section with proper formatting
        for section_name, section_content in sections.items():
            if section_content != f"📌 Title":  # Skip empty sections
                formatted_response += f"{section_content}\n{separator}"
        
        return formatted_response
    
    # For other styles, use the existing templates
    section_templates = {
        "summary": {
            "main": "✨ Legal Summary ✨\n{content}\n",
            "points": "🌟 Key Legal Points 🌟\n{points}\n",
            "conclusion": "🎯 Conclusion\n{conclusion}\n"
        },
        "list": {
            "main": "📋 Legal Overview 📋\n{content}\n",
            "points": "📝 Legal Breakdown 📝\n{points}\n",
            "conclusion": "🎯 Conclusion\n{conclusion}\n"
        },
        "comparison": {
            "main": "🔄 Legal Comparison 🔄\n{content}\n",
            "points": "📊 Legal Analysis 📊\n{points}\n",
            "conclusion": "🎯 Conclusion\n{conclusion}\n"
        },
        "explanation": {
            "main": "💡 Legal Explanation 💡\n{content}\n",
            "points": "🔑 Legal Implications 🔑\n{points}\n",
            "conclusion": "🎯 Conclusion\n{conclusion}\n"
        },
        "definition": {
            "main": "📚 Legal Definition 📚\n{content}\n",
            "points": "📖 Legal Context 📖\n{points}\n",
            "conclusion": "🎯 Conclusion\n{conclusion}\n"
        },
        "case_ruling": {
            "main": "⚖️ Case Analysis ⚖️\n{content}\n",
            "points": "📋 Legal Implications 📋\n{points}\n",
            "conclusion": "🎯 Conclusion\n{conclusion}\n"
        },
        "legal_reference": {
            "main": "📜 Legal Reference 📜\n{content}\n",
            "points": "📝 Legal Interpretation 📝\n{points}\n",
            "conclusion": "🎯 Conclusion\n{conclusion}\n"
        },
        "court_composition": {
            "main": "🏛️ Court Information 🏛️\n{content}\n",
            "points": "👥 Legal Details 👥\n{points}\n",
            "conclusion": "🎯 Conclusion\n{conclusion}\n"
        }
    }
    
    template = section_templates.get(style, section_templates["summary"])
    
    # Format the main content
    main_content = template["main"].format(content=response_text)
    
    # Format the points section
    if style == "list":
        items = [item.strip() for item in response_text.split("\n") if item.strip()]
        points = "• " + "\n• ".join(items[1:])
    else:
        points = "• " + "\n• ".join(response_text.split(". ")[:3])
    
    points_content = template["points"].format(points=points)
    
    # Format the conclusion
    conclusion = "• " + "\n• ".join(response_text.split(". ")[-3:])
    conclusion_content = template["conclusion"].format(conclusion=conclusion)
    
    # Add decorative separators
    separator = "═" * 50 + "\n"
    
    # Combine all sections with proper spacing and separators
    formatted_response = f"\n{separator}{main_content}{separator}{points_content}{separator}{conclusion_content}{separator}"
    
    return formatted_response


def get_llm_response(question: str, context: Optional[str] = None) -> str:
    """
    Get response from LLM with enhanced formatting and styling.
    
    Args:
        question (str): User's question
        context (Optional[str]): Additional context for the question
        
    Returns:
        str: Formatted response with sections and styling
    """
    try:
        # For general questions, use a simpler prompt
        if not is_legal_question(question):
            prompt = ChatPromptTemplate.from_messages([
                SystemMessage(content="""You are a helpful assistant. Provide clear and concise responses.
                Keep your answers brief and friendly.
                Use **bold text** for emphasis when needed."""),
                HumanMessage(content=question)
            ])
        else:
            # Get relevant context from vector store for legal questions
            retriever = get_retriever()
            if retriever:
                docs = retriever.get_relevant_documents(question)
                context = "\n".join([doc.page_content for doc in docs])
            
            prompt = ChatPromptTemplate.from_messages([
                SystemMessage(content="""You are a legal expert assistant. Provide detailed, accurate, and well-structured responses.
                Format your response in the following sections:
                1. Title: A clear title for the response
                2. Legal Section: Relevant legal provisions or sections
                3. Analysis: Detailed analysis of the legal aspects
                4. Description: Comprehensive description of the legal concept
                5. Legal Implications: Key implications and consequences
                6. References: Relevant legal references and citations
                7. Conclusion: A concise summary of key points and final thoughts
                
                Use bullet points for lists and key points.
                Include relevant legal references and citations where applicable.
                Maintain a professional and authoritative tone.
                Make your responses engaging and easy to understand.
                Use **bold text** for important legal terms and concepts.
                In the conclusion, summarize the main points and provide a clear final statement."""),
                HumanMessage(content=f"Context: {context}\n\nQuestion: {question}")
            ])
        
        # Get response from LLM
        response = llm.invoke(prompt.format_messages())
        response_text = response.content
        
        # Determine response style and format
        style = determine_response_style(question)
        formatted_response = format_response_with_sections(response_text, style)
        
        # Store in conversation history
        conversation_history.append((question, formatted_response))
        save_history()
        
        print_colored("Generated response with enhanced formatting", "green")
        return formatted_response
        
    except Exception as e:
        error_message = f"❌ Error: {str(e)}"
        print_colored(error_message, "red")
        return error_message