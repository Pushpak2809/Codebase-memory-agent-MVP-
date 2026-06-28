import hashlib
import hmac

from fastapi import APIRouter, Header, HTTPException, Request

from app.core.config import settings

router = APIRouter()


@router.post("/github")
async def github_webhook(request: Request, x_hub_signature_256: str | None = Header(default=None)):
    body = await request.body()
    if settings.github_webhook_secret:
        expected = "sha256=" + hmac.new(
            settings.github_webhook_secret.encode("utf-8"),
            body,
            hashlib.sha256,
        ).hexdigest()
        if not x_hub_signature_256 or not hmac.compare_digest(expected, x_hub_signature_256):
            raise HTTPException(status_code=401, detail="Invalid GitHub webhook signature.")
    return {"status": "accepted"}
