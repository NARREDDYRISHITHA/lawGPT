# Docker Setup for LawGPT

This document explains how to use Docker to deploy the LawGPT application.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Setup Instructions

1. **Clone the repository**

   ```bash
   git clone [repository-url]
   cd lawGPT
   ```

2. **Configure environment variables**

   Copy the template environment file and fill in your Google API key:

   ```bash
   cp .env.template .env
   ```

   Edit the `.env` file and replace `your_google_api_key_here` with your actual Google API key.

3. **Build and start the containers**

   ```bash
   docker-compose up -d --build
   ```

   This will build both the backend and frontend containers and start them in detached mode.

4. **Access the application**

   - Frontend: http://localhost
   - Backend API: http://localhost:8800

## Container Structure

- **Backend Container**: Python FastAPI server running on port 8800
- **Frontend Container**: Nginx server hosting the React SPA on port 80

## Persistent Data

The following volumes are configured for data persistence:

- `./books:/app/books`: PDF books directory
- `./db_data:/app/db`: Vector database storage

## Stopping the Application

To stop the containers:

```bash
docker-compose down
```

## Troubleshooting

- **Backend not starting**: Check the logs with `docker-compose logs backend`
- **Frontend not connecting to backend**: Ensure the backend container is running and check the Nginx configuration

## Production Considerations

For production deployment, consider:

1. Using a proper secret management solution instead of `.env` files
2. Setting up HTTPS with a reverse proxy or using Docker Swarm/Kubernetes
3. Implementing proper access control and authentication
4. Setting up monitoring and logging
