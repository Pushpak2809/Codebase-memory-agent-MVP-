from __future__ import annotations

from github import Github, GithubException

from app.core.config import settings


def read_pull_request_diff(repo_name: str, pr_number: int) -> dict:
    if not settings.has_github_api:
        raise RuntimeError("GITHUB_TOKEN is not configured.")
    try:
        github = Github(settings.github_token)
        repo = github.get_repo(repo_name)
        pull = repo.get_pull(pr_number)
        files = list(pull.get_files())
    except GithubException as exc:
        raise RuntimeError(f"GitHub pull request could not be read: {exc.data}") from exc
    diff_text = "\n".join(
        f"diff --git a/{file.filename} b/{file.filename}\n{file.patch or ''}"
        for file in files
    )
    return {
        "repo": repo_name,
        "pr_number": pr_number,
        "title": pull.title,
        "source": "github",
        "diff_text": diff_text or pull.body or pull.title,
    }
