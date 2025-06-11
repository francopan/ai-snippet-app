# Tech Challenge

## Challenge — “AI Snippet Service”

### 1. Background

Content teams often need a quick way to paste in raw text (blog drafts, transcripts, etc.) and get back short, AI-generated summaries they can reuse elsewhere. You’ll build the back-end for such a service.

---

### 2. Your Task

Create a small service that lets users:

| Action | Endpoint | Description |
|--------|----------|-------------|
| Create | `POST /snippets` | Accepts `{ "text": "…raw content…" }`; stores the snippet; returns `{ id, text, summary }`. The summary is produced by an AI provider (OpenAI, Gemini, or similar). |
| Read one | `GET /snippets/:id` | Returns `{ id, text, summary }`. |
| List all | `GET /snippets` | Returns the snippet list `[ { id, text, summary } ]`. |

You should provide **two separate code components**:

- A **UI** implemented with a JavaScript frontend framework.
- An **API** implemented with a JavaScript backend framework.

---

### 3. Requirements

| Area | Must-have |
|------|-----------|
| **Tech stack** | Node 20+, TypeScript. We use **Remix** in our UI and **Express** in our APIs, but feel free to use any JS framework you like. |
| **TDD** | Use Jest or Vitest, plus Supertest. Commit test-first where practical. |
| **AI API** | Call OpenAI, Google Gemini, or Hugging Face Inference to generate the summary. Keep the prompt simple (e.g., "Summarize in ~30 words"). Make the API key/token an environment variable. |
| **Database** | MongoDB preferred. |
| **Docker** | Provide a working `Dockerfile` + `docker-compose.yml`. `docker compose up` should run tests and then start the API server on port `3000` and the UI on `3030`. |
| **Git** | Push to your own GitHub/GitLab repo. Commit history should show incremental progress and TDD cycles (no single “final commit” drop). |
| **Time box** | Core spec should take roughly **3 hours**. Budget your time; it’s okay to stub some details if you document the gaps. |

---

### 4. Deliverables

- 🔗 **Repository URL** (public)
- 📄 `README.md` with:
  - Setup instructions (local & Docker)
  - How to run tests
  - Request examples (curl / Postman)
  - Clear instructions for obtaining and setting required API keys
- 🧾 **Source code** with:
  - `/src` (Express routes, services, tests)
  - `/docker` or root-level Dockerfile + compose
- 📝 **Post-challenge reflection** (max ½ page in the `README.md`):
  - What you’d improve with more time
  - Trade-offs made

---

### 5. Stretch Goals *(optional, if time remains)*

- Role-based snippet owners (simple JWT auth)
- Streaming AI summary via Server-Sent Events (SSE)
- CI pipeline (GitHub Actions) that lints, tests, and builds the Docker image

---

### 6. What We Evaluate

| Criterion | What we look for |
|----------|------------------|
| **Code quality & architecture** | Clean, idiomatic TypeScript; small, testable units |
| **TDD discipline** | Meaningful tests written alongside code, not retrofitted |
| **API design** | RESTful conventions, helpful error messages, 4xx/5xx handling |
| **Security & env management** | Keys in env vars, no secrets in repo |
| **Containerization** | Image size, reproducibility, ease of spin-up |
| **Communication** | Concise README, clear commit messages, sensible Git history |
| **Time awareness** | Core done within ~3 hours; reflection on what’s left |

---
