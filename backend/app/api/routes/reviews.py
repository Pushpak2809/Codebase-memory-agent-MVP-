from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.schemas.review import ReviewRequest, ReviewResult
from app.services.github import read_pull_request_diff
from app.services.agent import run_review

router = APIRouter()
review_history: list[dict] = []


class TriggerRequest(BaseModel):
    repo: str
    pr_number: int


def review_to_history_item(result: ReviewResult, request: ReviewRequest) -> dict:
    severity = result.findings[0].severity if result.findings else "low"
    return {
        **result.model_dump(),
        "title": request.title or request.repo or "Manual diff review",
        "repo": request.repo,
        "pr_number": request.pr_number,
        "source": request.source,
        "severity": severity,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }


def record_review(result: ReviewResult, request: ReviewRequest) -> ReviewResult:
    review_history.insert(0, review_to_history_item(result, request))
    del review_history[50:]
    return result


@router.get("")
async def list_reviews():
    return {"reviews": review_history, "total": len(review_history)}


@router.post("/analyze", response_model=ReviewResult)
async def analyze_review(payload: ReviewRequest):
    result = await run_review(payload)
    return record_review(result, payload)


@router.post("/trigger", response_model=ReviewResult)
async def trigger_review(payload: TriggerRequest):
    pr_data = read_pull_request_diff(payload.repo, payload.pr_number)
    request = ReviewRequest(**pr_data)
    result = await run_review(request)
    return record_review(result, request)


@router.get("/{review_id}")
async def get_review(review_id: str):
    for review in review_history:
        if review["id"] == review_id:
            return review
    raise HTTPException(status_code=404, detail="Review not found")
