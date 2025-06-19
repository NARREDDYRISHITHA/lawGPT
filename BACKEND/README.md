# LawGPT Backend

This is the backend API service for LawGPT, a legal case research assistant that helps law students find relevant case information.

## Project Structure

```
BACKEND/
├── api/                # API routes and endpoints
│   ├── __init__.py
│   └── routes.py
├── config/            # Configuration settings
│   ├── __init__.py
│   └── settings.py
├── models/            # Data models
│   ├── __init__.py
│   └── question.py
├── services/          # Business logic services
│   ├── __init__.py
│   ├── llm_service.py
│   ├── pdf_service.py
│   └── vector_db_service.py
├── utils/             # Helper utilities
│   ├── __init__.py
│   └── helpers.py
├── app.py             # FastAPI application server
├── main.py            # Main application entry point
├── api_server.py      # API server entry point
└── requirements.txt   # Project dependencies
```

## Setup and Installation

1. Create a virtual environment:

   ```
   python -m venv venv
   source venv/bin/activate  # On Windows use: venv\Scripts\activate
   ```

2. Install dependencies:

   ```
   pip install -r requirements.txt
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   GOOGLE_API_KEY=your_google_api_key
   ```

## Running the Application

Start the API server:

```
python api_server.py
```

The API will be available at http://localhost:8800

## API Endpoints

- `POST /api/ask` - Submit a legal question
- `GET /health` - Health check endpoint

## Dependencies

- FastAPI - Web framework for building APIs
- Langchain - Framework for working with large language models
- Google Generative AI - For LLM and embeddings
- FAISS - Vector storage for similarity search
