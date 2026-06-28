from fastapi import APIRouter

from app.core.config import settings

router = APIRouter()


@router.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "codebase-memory-agent",
        "integrations": {
            "hindsight": settings.has_hindsight,
            "github_api": settings.has_github_api,
            "github_oauth": settings.has_github_oauth,
            "groq": settings.has_groq,
            "openai": settings.has_openai,
        },
    }
