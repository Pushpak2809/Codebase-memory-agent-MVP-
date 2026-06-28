from fastapi import APIRouter

router = APIRouter()


@router.get("")
async def cost_dashboard():
    return {
        "month_spend_usd": 2.99,
        "savings_percent": 68,
        "models": [
            {"model": "llama-3.1-8b-instant", "provider": "groq", "cost_usd": 0.38},
            {"model": "llama-3.3-70b-versatile", "provider": "groq", "cost_usd": 0.72},
            {"model": "gpt-4o", "provider": "openai", "cost_usd": 1.89},
        ],
    }
