from __future__ import annotations

from datetime import datetime, timezone
import json
from pathlib import Path
import uuid

import httpx

from app.core.config import settings
from app.services.http import async_client

_LOCAL_MEMORY_PATH = Path(__file__).resolve().parents[2] / ".local_memory.json"
_LOCAL_MEMORY: list[dict] = []


def configured() -> bool:
    return settings.has_hindsight


def _load_local_memory() -> list[dict]:
    global _LOCAL_MEMORY
    if not _LOCAL_MEMORY and _LOCAL_MEMORY_PATH.exists():
        try:
            raw = json.loads(_LOCAL_MEMORY_PATH.read_text(encoding="utf-8"))
            if isinstance(raw, list):
                _LOCAL_MEMORY = [item for item in raw if isinstance(item, dict)]
        except (OSError, json.JSONDecodeError):
            _LOCAL_MEMORY = []
    return _LOCAL_MEMORY


def _save_local_memory() -> None:
    try:
        _LOCAL_MEMORY_PATH.write_text(json.dumps(_LOCAL_MEMORY, indent=2), encoding="utf-8")
    except OSError:
        pass


def _local_title(content: str, metadata: dict) -> str:
    # Prefer metadata pr_name if available
    if metadata.get("pr_name"):
        return str(metadata["pr_name"])
    if metadata.get("title"):
        return str(metadata["title"])
    # Parse from content format
    first_line = content.splitlines()[0] if content.splitlines() else "Local memory"
    return first_line.removeprefix("PR: ").strip() or "Local memory"


def _local_summary(content: str, metadata: dict | None = None) -> str:
    # Prefer metadata summary if available
    if metadata and metadata.get("summary"):
        return str(metadata["summary"])
    # Extract from content - look for "Issues found:" section
    marker = "Issues found:"
    if marker in content:
        issues_section = content.split(marker, 1)[1].strip()
        first_lines = issues_section.split('\n')[:2]
        return ' '.join([l.strip() for l in first_lines if l.strip()])
    return content.strip()[:200]


def _local_recall(query: str, limit: int = 5) -> list[dict]:
    local_memory = _load_local_memory()
    if not local_memory:
        return []
    terms = {term for term in query.lower().split() if len(term) > 2}

    def score(item: dict) -> float:
        haystack = f"{item.get('title', '')} {item.get('summary', '')} {' '.join(item.get('tags', []))}".lower()
        if not terms:
            return 0.5
        matches = sum(1 for term in terms if term in haystack)
        return matches / max(len(terms), 1)

    ranked = sorted(
        ({**item, "similarity": score(item)} for item in local_memory),
        key=lambda item: (item["similarity"], item.get("created_at", "")),
        reverse=True,
    )
    return ranked[:limit]


async def recall_memory(query: str) -> list[dict]:
    if not configured():
        return _local_recall(query)
    payload = {"bank_id": settings.hindsight_bank_id, "query": query, "top_k": 5}
    headers = {"Authorization": f"Bearer {settings.hindsight_api_key}"}
    try:
        async with async_client(timeout=12) as client:
            response = await client.post(f"{settings.hindsight_base_url.rstrip('/')}/recall", json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()
    except httpx.HTTPError:
        return _local_recall(query)
    results = data.get("results", data if isinstance(data, list) else [])
    recalled = [
        {
            "id": item.get("id", ""),
            "title": item.get("title") or item.get("metadata", {}).get("pr_name") or item.get("metadata", {}).get("title") or "Recalled memory",
            "source": item.get("source") or item.get("metadata", {}).get("source") or "Hindsight",
            "summary": item.get("content") or item.get("summary") or "",
            "similarity": float(item.get("score") or item.get("similarity") or 0.0),
            "tags": item.get("tags") or item.get("metadata", {}).get("tags") or [],
            "content": item.get("content") or "",
            "metadata": item.get("metadata", {}),
            "created_at": item.get("created_at") or item.get("metadata", {}).get("created_at"),
        }
        for item in results
        if isinstance(item, dict)
    ]
    seen = {(item.get("title"), item.get("summary")) for item in recalled}
    local = [item for item in _local_recall(query) if (item.get("title"), item.get("summary")) not in seen]
    return (recalled + local)[:5]


async def retain_memory(content: str, metadata: dict) -> bool:
    local_item = {
        "id": f"mem-{uuid.uuid4().hex[:8]}",
        "title": _local_title(content, metadata),
        "source": metadata.get("source") or metadata.get("source") or "local",
        "summary": _local_summary(content, metadata),
        "tags": metadata.get("tags") or [tag for tag in [metadata.get("repo"), metadata.get("complexity")] if tag],
        "content": content,
        "metadata": metadata,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "similarity": 1.0,
    }
    _load_local_memory()
    _LOCAL_MEMORY.insert(0, local_item)
    del _LOCAL_MEMORY[100:]
    _save_local_memory()

    if not configured():
        return True
    payload = {"bank_id": settings.hindsight_bank_id, "content": content, "metadata": metadata}
    headers = {"Authorization": f"Bearer {settings.hindsight_api_key}"}
    try:
        async with async_client(timeout=12) as client:
            response = await client.post(f"{settings.hindsight_base_url.rstrip('/')}/retain", json=payload, headers=headers)
            response.raise_for_status()
        return True
    except httpx.HTTPError:
        return False
