from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.services.hindsight import configured, recall_memory, retain_memory

router = APIRouter()


class CreateMemoryRequest(BaseModel):
    content: str = Field(min_length=1)
    title: str | None = None
    source: str = "manual"
    tags: list[str] = Field(default_factory=list)
    metadata: dict = Field(default_factory=dict)


@router.get("")
async def list_memory(query: str | None = None):
    recall_query = query or "recent code review memory"
    memories = await recall_memory(recall_query)
    return {"query": query, "memories": memories, "hindsight_configured": configured()}


@router.post("")
async def create_memory(payload: CreateMemoryRequest):
    metadata = {
        **payload.metadata,
        "title": payload.title,
        "source": payload.source,
        "tags": payload.tags,
    }
    retained = await retain_memory(payload.content, metadata)
    return {"status": "retained" if retained else "retain_failed", "retained": retained, "hindsight_configured": configured()}
