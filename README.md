# AI Snippet App

This project implements a backend and frontend for an AI snippet summary application. Users can submit raw text snippets and receive AI-generated summaries for reuse in content workflows.

## Setup Instructions

### Prerequisites

- Node.js 20 or higher  
- Docker & Docker Compose  
- MongoDB (local or via Docker)  
- AI API key 
### Local Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/francopan/ai-snippet-app.git
   cd ai-snippet-app
   ```

2. Install dependencies for backend and frontend:

   ```bash
   cd api && npm install
   cd ../ui && npm install
   ```

3. Set up `.env` files in each relevant directory (`ui` and `api`). Rename the existing `.env.example` file to `.env` and fill in the required environment variables.

4. Run backend and frontend servers separately for development:

   ```bash
   # Backend
   cd backend
   npm run dev

   # Frontend
   cd ../frontend
   npm run dev
   ```

### Docker Setup

Rename the existing `.env.example` file to `.env` in root directory and fill in the required environment variables.

To build, run tests, and start all services using Docker:

```bash
docker compose up --build
```

- API server will be accessible at `http://localhost:3000`  
- Frontend UI will be accessible at `http://localhost:3030`  


Note, UI might need a refresh if displays an error.

## Running Tests

For each app directory, run:

```bash
npm run test
```


## API Usage Examples

### Create a snippet

```bash
curl -X POST http://localhost:3000/snippets \
  -H "Content-Type: application/json" \
  -d '{"text": "Your raw content here"}'
```

Response:

```json
{
  "id": "123abc",
  "text": "Your raw content here",
  "summary": null // Will be null because is generating on the background
}
```

### Get a snippet by ID

```bash
curl http://localhost:3000/snippets/123abc
```

### List all snippets

```bash
curl http://localhost:3000/snippets
```

---

## Environment Variables

| Variable   | Description                                  | Required |
|------------|----------------------------------------------|----------|
| `CHAT_API_KEY` | API key for AI provider                  | Yes      |
| `MONGO_URI`  | MongoDB connection string                  | Yes      |
| `PUBLIC_API_URL`  | Snippet API URL                       | Yes      |


## Post-challenge Reflection

- **What I’d improve given more time:**  
  - Setup a CI pipeline (GitHub Actions) to update images automatically in server.  
  - Enhance error handling, adding translation keys and reusing strings, also improving input validation.  
  - Fix CMD script to not use dev script.
  - Implement JWT authentication.
  - Add pagination to list, allow user to delete or retry snippet summary generation.

- **Trade-offs made:**  
  - Kept the AI prompt simple to prioritize core functionality.
  - Chose a lightweight local LLM for enhanced privacy. However, its smaller size impacts the quality of results.
  - AI summaries are not generated during the initial POST request to avoid blocking the user. As streaming is not implemented, users must refresh the page to view the summary.


