"""
PDF processing service for LawGPT application.
"""
import os
import hashlib
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from config.settings import CHUNK_SIZE, CHUNK_OVERLAP, DB_DIR
from utils.helpers import print_colored, get_pdf_hash


def process_pdf(pdf_path):
    """Process the PDF file and create document chunks"""
    print_colored(f"Processing PDF: {pdf_path}", "yellow")
    
    try:
        # Create a hash of the PDF file to use as an identifier
        pdf_hash = get_pdf_hash(pdf_path)
        
        # Load and split the PDF
        loader = PyPDFLoader(pdf_path)
        documents = loader.load()
        
        print_colored(f"✓ Loaded {len(documents)} pages from PDF", "green")
        
        # Split the documents into chunks optimized for embedding
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=CHUNK_SIZE,
            chunk_overlap=CHUNK_OVERLAP,
            separators=["\n\n", "\n", " ", ""]
        )
        docs = text_splitter.split_documents(documents)
        
        print_colored(f"✓ Split into {len(docs)} chunks for processing", "green")
        
        return docs, pdf_hash
    
    except Exception as e:
        print_colored(f"Error processing PDF: {str(e)}", "red")
        return None, None