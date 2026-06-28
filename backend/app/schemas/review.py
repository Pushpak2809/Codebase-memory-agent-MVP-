from pydantic import BaseModel, Field


class ReviewRequest(BaseModel):
    repo: str | None = None
    pr_number: int | None = None
    title: str | None = None
    diff_text: str = Field(min_length=1)
    source: str = "upload"


class MemoryCitation(BaseModel):
    title: str
    source: str
    summary: str
    similarity: float


class ReviewFinding(BaseModel):
    severity: str
    title: str
    detail: str
    file_path: str | None = None


class ReviewResult(BaseModel):
    id: str
    status: str
    summary: str
    model_used: str
    cost_usd: float
    latency_ms: int
    memory_hits: int
    findings: list[ReviewFinding]
    citations: list[MemoryCitation]
