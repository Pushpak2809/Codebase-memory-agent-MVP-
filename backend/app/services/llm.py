from __future__ import annotations

import httpx

from app.core.config import settings
from app.services.http import async_client


async def analyze_with_llm(diff_text: str, memory_context: list[dict], complexity: str) -> dict:
    provider_error = None


    if settings.has_groq:
        try:
            return await _groq_review(diff_text, memory_context, complexity)
        except (httpx.HTTPError, KeyError, IndexError, ValueError) as exc:
            provider_error = exc

    if provider_error:
        return _local_review(
            "Live model provider unavailable",
            f"The configured model providers could not complete the request: {provider_error}",
        )

    return _local_review(
        "Live model provider not configured",
        "The review pipeline is wired, but no usable LLM provider key was available at runtime.",
    )


def _local_review(finding_title: str, finding_detail: str) -> dict:
    return {
        "summary": "CMA analyzed the diff locally. Configure a reachable Groq or OpenAI provider to enable live model review.",
        "finding_title": finding_title,
        "finding_detail": finding_detail,
        "model": "local-fallback",
        "cost": 0.0,
    }


def _prompt(diff_text: str, memory_context: list[dict]) -> list[dict]:
    memories = "\n".join(f"- {item.get('title', 'Memory')}: {item.get('summary', '')}" for item in memory_context[:5])
    return [
        {
            "role": "user",
            "content": f"""You are an expert code reviewer.
Analyze the PR diff and return findings in STRICT JSON format only.
Do NOT write paragraphs. Do NOT write summaries. Return ONLY valid JSON.

PAST MEMORY CONTEXT:
{memories or 'None'}

PR DIFF:
{diff_text[:14000]}

Return this exact JSON structure:
{{
  "summary_line": "One sentence — what this PR does",
  "total_findings": <number>,
  "findings": [
    {{
      "id": 1,
      "severity": "critical" | "high" | "medium" | "low",
      "title": "Short issue title, max 8 words",
      "file": "path/to/file.py",
      "line": <line number or null>,
      "issue": "2-3 sentences explaining the exact problem.",
      "fix": "Concrete fix suggestion, include short code snippet if useful.",
      "memory_match": "Relevant past finding from memory context, or null",
      "memory_pr": "e.g. PR #12, or null"
    }}
  ],
  "model_used": "{{model}}",
  "cost_usd": {{cost}}
}}

Rules:
- Only report issues visible in the diff
- Do not invent findings
- If no issues, return findings as empty array []
- Never write any text outside the JSON block
""",
        },
    ]


async def _groq_review(diff_text: str, memory_context: list[dict], complexity: str) -> dict:
    model = "llama-3.1-8b-instant" if complexity == "simple" else "llama-3.3-70b-versatile"
    async with async_client(timeout=30) as client:
        response = await client.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={"Authorization": f"Bearer {settings.groq_api_key}"},
            json={"model": model, "messages": _prompt(diff_text, memory_context), "temperature": 0.1},
        )
        response.raise_for_status()
        content = response.json()["choices"][0]["message"]["content"]
    return {
        "summary": content,
        "finding_title": "Memory-grounded review generated",
        "finding_detail": content,
        "model": model,
        "cost": 0.001 if complexity == "simple" else 0.004,
    }


async def _openai_review(diff_text: str, memory_context: list[dict]) -> dict:
    model = "gpt-4o"
    async with async_client(timeout=45) as client:
        response = await client.post(
            "https://api.openai.com/v1/chat/completions",
            headers={"Authorization": f"Bearer {settings.openai_api_key}"},
            json={"model": model, "messages": _prompt(diff_text, memory_context), "temperature": 0.1},
        )
        response.raise_for_status()
        content = response.json()["choices"][0]["message"]["content"]
    return {
        "summary": content,
        "finding_title": "Complex review generated",
        "finding_detail": content,
        "model": model,
        "cost": 0.018,
    }
