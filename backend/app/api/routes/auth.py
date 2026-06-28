from urllib.parse import urlencode

import httpx
from fastapi import APIRouter, HTTPException
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, EmailStr

from app.core.config import settings
from app.services.http import async_client

router = APIRouter()


class AuthRequest(BaseModel):
    email: EmailStr
    password: str


@router.post("/signin")
async def signin(payload: AuthRequest):
    return {"access_token": "dev-token", "token_type": "bearer", "user": {"email": payload.email}}


@router.post("/signup")
async def signup(payload: AuthRequest):
    return {"access_token": "dev-token", "token_type": "bearer", "user": {"email": payload.email}}


def github_callback_url() -> str:
    return f"{settings.backend_url.rstrip('/')}/auth/github/callback"


@router.get("/github")
async def github_oauth_start():
    if not settings.has_github_oauth:
        raise HTTPException(status_code=503, detail="GitHub OAuth is not configured.")
    params = urlencode(
        {
            "client_id": settings.github_oauth_client_id,
            "redirect_uri": github_callback_url(),
            "scope": "read:user user:email repo",
            "allow_signup": "true",
        }
    )
    return RedirectResponse(f"https://github.com/login/oauth/authorize?{params}")


@router.get("/github/callback")
async def github_oauth_callback(code: str | None = None, error: str | None = None):
    frontend = settings.frontend_url.rstrip("/")
    if error:
        return RedirectResponse(f"{frontend}/signin?error={error}")
    if not code:
        return RedirectResponse(f"{frontend}/signin?error=missing_code")

    try:
        async with async_client(timeout=12) as client:
            response = await client.post(
                "https://github.com/login/oauth/access_token",
                headers={"Accept": "application/json"},
                json={
                    "client_id": settings.github_oauth_client_id,
                    "client_secret": settings.github_oauth_client_secret,
                    "code": code,
                    "redirect_uri": github_callback_url(),
                },
            )
            response.raise_for_status()
            github_token = response.json().get("access_token")
    except httpx.HTTPError:
        return RedirectResponse(f"{frontend}/signin?error=github_oauth_failed")

    if not github_token:
        return RedirectResponse(f"{frontend}/signin?error=github_oauth_failed")

    return RedirectResponse(f"{frontend}/auth/callback?token=github-dev-token")
