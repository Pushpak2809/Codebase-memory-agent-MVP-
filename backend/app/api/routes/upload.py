from fastapi import APIRouter, File, HTTPException, UploadFile

from app.core.config import settings
from app.api.routes.reviews import record_review
from app.schemas.review import ReviewRequest, ReviewResult
from app.services.agent import run_review

router = APIRouter()


@router.post("/upload", response_model=ReviewResult)
async def upload_review(file: UploadFile = File(...)):
    allowed = {".diff", ".patch", ".txt"}
    suffix = "." + file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if suffix not in allowed:
        raise HTTPException(status_code=400, detail="Upload a .diff, .patch, or .txt file.")
    raw = await file.read()
    if len(raw) > settings.max_upload_size_mb * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File exceeds upload size limit.")
    text = raw.decode("utf-8", errors="replace")
    if len(text.splitlines()) > settings.max_diff_lines:
        raise HTTPException(status_code=413, detail="Diff exceeds line limit.")
    request = ReviewRequest(title=file.filename, diff_text=text, source="upload")
    result = await run_review(request)
    return record_review(result, request)
