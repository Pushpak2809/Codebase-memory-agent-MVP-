# 🧠 Codebase Memory Agent

> **Your team's engineering brain — never lose context on a PR again.**

Codebase Memory Agent is a GitHub-native tool that automatically reviews pull requests against your team's retained engineering memory — every past bug fix, architectural decision, and pattern your team has ever documented.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Site-brightgreen?style=for-the-badge)](https://codebase-memory-agent-mvp-nzkq.vercel.app/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github)](https://github.com/Pushpak2809/Codebase-memory-agent-MVP-)

---

## ✨ Features

- **Automated PR Reviews** — Triggered by GitHub webhooks, reviews every pull request against your team's memory bank
- **Persistent Engineering Memory** — Retains architectural decisions, bug patterns, and team conventions across time
- **LLM-Powered Analysis** — Uses Groq and OpenAI for fast, intelligent code review commentary
- **GitHub Native** — Posts review comments directly on PRs via GitHub OAuth
- **Incremental Integrations** — Hindsight Cloud memory, CascadeFlow model routing, and Supabase persistence are all plug-and-play via environment variables

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React + Vite |
| **Backend** | FastAPI (Python) |
| **Database** | Supabase (PostgreSQL) |
| **Memory** | Hindsight Cloud |
| **Model Routing** | CascadeFlow |
| **LLM Providers** | Groq, OpenAI |
| **Auth & Events** | GitHub OAuth + Webhooks |
| **Deployment** | Vercel |

---

## 🚀 Live Demo

**[https://codebase-memory-agent-mvp-nzkq.vercel.app/](https://codebase-memory-agent-mvp-nzkq.vercel.app/)**

---

## 📁 Project Structure

```
Codebase-memory-agent-MVP-/
├── frontend/               # React + Vite app
├── backend/                # FastAPI server
├── database/               # DB schema and migrations
├── .github/workflows/      # CI/CD pipelines
├── .env.example            # Environment variable template
├── docker-compose.yml      # Local multi-service setup
├── vercel.json             # Vercel deployment config
└── README.md
```

---

## ⚙️ Local Development

### Prerequisites

- Node.js 18+
- Python 3.10+
- Git

### 1. Clone the repo

```bash
git clone https://github.com/Pushpak2809/Codebase-memory-agent-MVP-.git
cd Codebase-memory-agent-MVP-
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Fill in your keys in `.env` (see [Environment Variables](#-environment-variables) below).

### 3. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at → **http://localhost:5173**

### 4. Start the backend (new terminal)

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend runs at → **http://localhost:8000**  
API docs at → **http://localhost:8000/docs**

---

## 🔑 Environment Variables

Copy `.env.example` to `.env` and fill in the values below.

### Backend

| Variable | Description |
|---|---|
| `HINDSIGHT_BASE_URL` | Your Hindsight Cloud instance URL |
| `HINDSIGHT_API_KEY` | Hindsight API key |
| `HINDSIGHT_BANK_ID` | Memory bank ID (default: `codebase-agent`) |
| `GITHUB_TOKEN` | GitHub personal access token |
| `GITHUB_WEBHOOK_SECRET` | Secret for validating GitHub webhook payloads |
| `GITHUB_OAUTH_CLIENT_ID` | GitHub OAuth app client ID |
| `GITHUB_OAUTH_CLIENT_SECRET` | GitHub OAuth app client secret |
| `GROQ_API_KEY` | Groq API key for LLM calls |
| `OPENAI_API_KEY` | OpenAI API key (fallback model) |
| `DATABASE_URL` | PostgreSQL connection string (Supabase) |
| `SECRET_KEY` | 32-character secret for session signing |
| `BACKEND_URL` | Backend base URL |
| `FRONTEND_URL` | Frontend base URL |
| `ENVIRONMENT` | `development` or `production` |
| `MAX_UPLOAD_SIZE_MB` | Max upload size in MB (default: `5`) |
| `MAX_DIFF_LINES` | Max PR diff lines to analyze (default: `10000`) |
| `REVIEW_TIMEOUT_SECONDS` | Timeout for LLM review calls (default: `30`) |

### Frontend

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Backend API URL (`http://localhost:8000` locally) |
| `VITE_APP_NAME` | App display name |

---

## ☁️ Deploying to Vercel

The project uses Vercel's `experimentalServices` for a monorepo deployment (frontend + backend in one project).

### 1. Push to GitHub

```bash
git add .
git commit -m "your message"
git push
```

### 2. Import project in Vercel

- Go to [vercel.com](https://vercel.com) → **Add New Project**
- Import your GitHub repo
- Set **Framework Preset** → **Services**

### 3. Add environment variables

In **Vercel Dashboard → Settings → Environment Variables**, add all variables from the table above, replacing localhost URLs with your production URLs:

```
VITE_API_BASE_URL  →  https://your-project.vercel.app/_/backend
BACKEND_URL        →  https://your-project.vercel.app/_/backend
FRONTEND_URL       →  https://your-project.vercel.app
```

### 4. Deploy

Vercel auto-deploys on every `git push` to `main`. ✅

---

## 🐳 Docker (Optional)

Run everything locally with Docker Compose:

```bash
docker-compose up --build
```

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m "add my feature"`
4. Push to your branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — feel free to use, modify, and distribute.

---

<p align="center">Built with ❤️ by <a href="https://github.com/Pushpak2809">Pushpak</a></p>
