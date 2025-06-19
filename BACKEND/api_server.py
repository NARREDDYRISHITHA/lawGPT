"""
Main API server entry point for the LawGPT application.
This is the file that should be run to start the FastAPI server.
"""
import uvicorn
from utils.helpers import print_colored, print_header
from config.settings import API_PORT, API_HOST
import os
import sys

if __name__ == "__main__":
    # Add the current directory to PYTHONPATH to allow imports from modules
    sys.path.append(os.path.dirname(os.path.dirname(__file__)))
    
    # Import the app from main.py to avoid circular imports
    from main import app
    
    print_header()
    print_colored("Starting FastAPI server...", "cyan")
    uvicorn.run(app, host=API_HOST, port=API_PORT)