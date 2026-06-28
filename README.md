# Codebase Memory Agent

Codebase Memory Agent is a GitHub-native SaaS product that reviews pull requests against a team's retained engineering memory.

## Stack

- Frontend: React + Vite, deployed on Vercel
- Backend: FastAPI, deployed on Railway
- Database: Supabase PostgreSQL
- Memory: Hindsight Cloud
- Model routing: CascadeFlow
- LLM providers: Groq and OpenAI
- GitHub: OAuth, webhook events, PR comments

## Local Development

```bash
cp .env.example .env
cd frontend
npm install
npm run dev
```

In another terminal:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Frontend: http://localhost:5173
Backend: http://localhost:8000
API docs: http://localhost:8000/docs

## Launch Notes

The frontend is production-shaped and responsive. The backend exposes the TRD route surface with local provider logic so the live Hindsight, CascadeFlow, GitHub OAuth, GitHub PR comments, and Supabase persistence can be connected incrementally through environment variables.
