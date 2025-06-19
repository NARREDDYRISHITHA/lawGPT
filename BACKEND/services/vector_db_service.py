"""
Vector database service for LawGPT application.
"""
import os
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import FAISS
from config.settings import DB_DIR, EMBEDDING_MODEL, RETRIEVER_SEARCH_K, RETRIEVER_FETCH_K
from utils.helpers import print_colored


def create_or_load_vector_db(docs, pdf_hash):
    """Create a new vector database or load an existing one"""
    # Define the database file path using the PDF hash
    db_path = os.path.join(DB_DIR, f"faiss_index")
    
    # Check if the vector database already exists
    if os.path.exists(db_path):
        print_colored(f"Loading existing vector database: {db_path}", "green")
        return load_vector_db(db_path)
    
    # If no database exists, create a new one
    print_colored("Creating new vector database...", "yellow")
    return create_vector_db(docs, db_path)


def create_vector_db(docs, db_path):
    """Create a new vector database from documents"""
    try:
        # Create embeddings
        print_colored("Generating document embeddings...", "yellow")
        embeddings = GoogleGenerativeAIEmbeddings(
            model=EMBEDDING_MODEL,
            task_type="retrieval_document"
        )
        
        # Use FAISS for vector storage
        vectorstore = FAISS.from_documents(
            docs,
            embeddings
        )
        
        # Save the FAISS index to disk for future use
        vectorstore.save_local(db_path)
        print_colored(f"✓ Vector database created and saved to {db_path}", "green")
        
        # Create retriever
        retriever = create_retriever(vectorstore)
        
        return retriever, docs
    
    except Exception as e:
        print_colored(f"Error creating vector database: {str(e)}", "red")
        return None, None


def load_vector_db(db_path):
    """Load an existing vector database"""
    try:
        # Create embeddings
        embeddings = GoogleGenerativeAIEmbeddings(
            model=EMBEDDING_MODEL,
            task_type="retrieval_document"
        )
        
        # Load FAISS index from disk with allow_dangerous_deserialization
        vectorstore = FAISS.load_local(
            db_path, 
            embeddings, 
            allow_dangerous_deserialization=True
        )
        print_colored(f"✓ Vector database loaded from {db_path}", "green")
        
        # Create retriever
        retriever = create_retriever(vectorstore)
        
        return retriever, None
        
    except Exception as e:
        print_colored(f"Error loading vector database: {str(e)}", "red")
        return None, None


def create_retriever(vectorstore):
    """Create a retriever from a vector store"""
    return vectorstore.as_retriever(
        search_type="mmr",
        search_kwargs={
            "k": RETRIEVER_SEARCH_K,
            "fetch_k": RETRIEVER_FETCH_K
        }
    )