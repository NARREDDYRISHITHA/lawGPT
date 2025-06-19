"""
Document processor service for LawGPT application.
Handles loading and processing of various document formats.
"""
import os
from typing import List
from langchain.document_loaders import PyPDFLoader, Docx2txtLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from config.settings import CHUNK_SIZE, CHUNK_OVERLAP
from utils.helpers import print_colored

def process_file(file_path: str) -> List[str]:
    """
    Process a document file and return chunks of text.
    
    Args:
        file_path (str): Path to the document file
        
    Returns:
        List[str]: List of text chunks
        
    Raises:
        ValueError: If file type is not supported
    """
    try:
        # Determine file type
        file_ext = os.path.splitext(file_path)[1].lower()
        
        # Load document based on type
        if file_ext == '.pdf':
            loader = PyPDFLoader(file_path)
        elif file_ext in ['.doc', '.docx']:
            loader = Docx2txtLoader(file_path)
        else:
            raise ValueError(f"Unsupported file type: {file_ext}")
            
        # Load and split document
        documents = loader.load()
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=CHUNK_SIZE,
            chunk_overlap=CHUNK_OVERLAP
        )
        chunks = text_splitter.split_documents(documents)
        
        print_colored(f"Created {len(chunks)} chunks from document", "green")
        return [chunk.page_content for chunk in chunks]
        
    except Exception as e:
        print_colored(f"Error processing document: {str(e)}", "red")
        raise 