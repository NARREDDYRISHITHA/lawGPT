"""
Vector store service for LawGPT application.
Handles document embeddings and retrieval using Chroma and Google's embeddings.
"""
import os
from typing import Optional, List
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain.vectorstores import Chroma
from config.settings import (
    GOOGLE_API_KEY,
    EMBEDDING_MODEL,
    DB_DIR,
    CHUNK_SIZE,
    CHUNK_OVERLAP
)
from utils.helpers import print_colored

# Initialize embeddings
embeddings = GoogleGenerativeAIEmbeddings(
    model=EMBEDDING_MODEL,
    google_api_key=GOOGLE_API_KEY
)

# Global variable to store the retriever
retriever = None

def get_retriever():
    """
    Get or initialize the vector store retriever.
    
    Returns:
        Optional[Chroma]: The initialized retriever if vector store exists, None otherwise
    """
    global retriever
    
    try:
        if retriever is None:
            # Check if vector store exists
            if os.path.exists(os.path.join(DB_DIR, "chroma")):
                # Initialize from existing store
                vector_store = Chroma(
                    persist_directory=os.path.join(DB_DIR, "chroma"),
                    embedding_function=embeddings
                )
                retriever = vector_store.as_retriever(
                    search_kwargs={"k": 5}
                )
                print_colored("Vector store loaded successfully", "green")
            else:
                print_colored("Vector store not found. Please process documents first.", "yellow")
                return None
                
        return retriever
        
    except Exception as e:
        print_colored(f"Error initializing vector store: {str(e)}", "red")
        return None

def process_document(chunks: List[str]) -> bool:
    """
    Process document chunks and add them to the vector store.
    
    Args:
        chunks (List[str]): List of text chunks to process
        
    Returns:
        bool: True if successful, False otherwise
    """
    global retriever
    
    try:
        # Create or load vector store
        vector_store = Chroma(
            persist_directory=os.path.join(DB_DIR, "chroma"),
            embedding_function=embeddings
        )
        
        # Add documents to vector store
        vector_store.add_texts(chunks)
        vector_store.persist()
        
        # Update retriever
        retriever = vector_store.as_retriever(
            search_kwargs={"k": 5}
        )
        
        print_colored(f"Successfully processed {len(chunks)} chunks", "green")
        return True
        
    except Exception as e:
        print_colored(f"Error processing document: {str(e)}", "red")
        return False 