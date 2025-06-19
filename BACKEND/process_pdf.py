"""
Script to process PDF and create vector database.
"""
import os
from dotenv import load_dotenv
from services.pdf_service import process_pdf
from services.vector_db_service import create_vector_db
from config.settings import DEFAULT_PDF_PATH
from utils.helpers import print_colored, check_environment

def main():
    # Load environment variables
    load_dotenv()
    
    # Check for required environment variables
    if not check_environment(["GOOGLE_API_KEY"]):
        return
    
    # Process the PDF
    print_colored("Starting PDF processing...", "yellow")
    docs, pdf_hash = process_pdf(DEFAULT_PDF_PATH)
    
    if not docs:
        print_colored("Failed to process PDF", "red")
        return
    
    # Create vector database
    print_colored("Creating vector database...", "yellow")
    retriever, _ = create_vector_db(docs, "db/faiss_index")
    
    if retriever:
        print_colored("✓ Vector database created successfully!", "green")
    else:
        print_colored("Failed to create vector database", "red")

if __name__ == "__main__":
    main() 