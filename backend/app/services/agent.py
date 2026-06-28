from __future__ import annotations

import time
import uuid

from app.schemas.review import MemoryCitation, ReviewFinding, ReviewRequest, ReviewResult
from app.services.hindsight import recall_memory, retain_memory
from app.services.llm import analyze_with_llm
from app.agent.tools.store_memory import format_memory_content, build_memory_metadata


async def run_review(request: ReviewRequest) -> ReviewResult:
    started = time.perf_counter()
    diff_lower = request.diff_text.lower()
    complex_review = any(token in diff_lower for token in ["auth", "token", "jwt", "database", "schema", "permission"])
    medium_review = not complex_review and len(request.diff_text.splitlines()) > 50
    complexity = "complex" if complex_review else "medium" if medium_review else "simple"
    recalled = await recall_memory(f"{request.title or ''}\n{request.diff_text[:2000]}")
    analysis = await analyze_with_llm(request.diff_text, recalled, complexity)
    citations = [
        MemoryCitation(
            title=item.get("title", "Recalled memory"),
            source=item.get("source", "Hindsight"),
            summary=item.get("summary", ""),
            similarity=float(item.get("similarity", 0.0)),
        )
        for item in recalled
    ]
    
    # Build findings list from analysis
    findings = []
    if analysis.get("findings"):
        for f in analysis["findings"]:
            finding = ReviewFinding(
                severity=f.get("severity", "low"),
                title=f.get("title", "Unknown issue"),
                detail=f.get("detail", ""),
                file_path=f.get("file", f.get("file_path")),
            )
            findings.append(finding)
    else:
        # Default finding if none provided
        findings = [ReviewFinding(
            severity="medium" if complex_review else "low",
            title=analysis["finding_title"],
            detail=analysis["finding_detail"],
        )]
    
    # Build clean memory content and metadata
    pr_name = request.title or request.repo or "manual diff"
    source = request.source or "UPLOAD"
    
    memory_content = format_memory_content(
        pr_name=pr_name,
        findings=findings,
        complexity=complexity,
        source=source.upper(),
        model_used=analysis["model"]
    )
    
    metadata = build_memory_metadata(
        pr_name=pr_name,
        source=source.upper(),
        complexity=complexity,
        model_used=analysis["model"],
        findings=findings
    )
    
    await retain_memory(
        content=memory_content,
        metadata=metadata,
    )
    
    return ReviewResult(
        id=f"rev-{uuid.uuid4().hex[:8]}",
        status="needs_attention" if complex_review else "clean",
        summary=analysis["summary"],
        model_used=analysis["model"],
        cost_usd=analysis["cost"],
        latency_ms=int((time.perf_counter() - started) * 1000),
        memory_hits=len(citations),
        findings=findings,
        citations=citations,
    )
