from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import auth, cost, health, memory, reviews, upload, webhook
from app.core.config import settings

app = FastAPI(title="Codebase Memory Agent API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, tags=["health"])
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(reviews.router, prefix="/reviews", tags=["reviews"])
app.include_router(upload.router, prefix="/reviews", tags=["upload"])
app.include_router(memory.router, prefix="/memory", tags=["memory"])
app.include_router(cost.router, prefix="/cost", tags=["cost"])
app.include_router(webhook.router, prefix="/webhook", tags=["webhook"])
