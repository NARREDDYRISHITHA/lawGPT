"""
Configuration settings for the LawGPT application.
"""
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Base directory
BASE_DIR = Path(__file__).resolve().parent.parent

# API Keys
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY environment variable is not set")

# Default PDF path
DEFAULT_PDF_PATH = os.path.join(BASE_DIR, "ilovepdf_merged.pdf")

# Books directory
BOOKS_DIR = os.path.join(BASE_DIR.parent, "books")

# Database directory for vector storage
DB_DIR = os.path.join(BASE_DIR, "db")
os.makedirs(DB_DIR, exist_ok=True)

# History file path
HISTORY_FILE = os.path.join(BASE_DIR, "conversation_history.pkl")

# API settings
API_PORT = 8800
API_HOST = "0.0.0.0"

# Model settings
EMBEDDING_MODEL = "models/embedding-001"
LLM_MODEL = "gemini-1.5-flash"
TEMPERATURE = 0.3
MAX_TOKENS = 2000
TOP_K = 40
TOP_P = 0.95

# Document processing settings
CHUNK_SIZE = 2000
CHUNK_OVERLAP = 200
RETRIEVER_SEARCH_K = 5
RETRIEVER_FETCH_K = 10