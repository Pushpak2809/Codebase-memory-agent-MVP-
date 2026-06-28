"""Memory storage tool with formatted human-readable content."""

from __future__ import annotations

from app.schemas.review import ReviewFinding


def format_memory_content(pr_name: str, findings: list, complexity: str, source: str, model_used: str) -> str:
    """
    Format memory content as a clean human-readable string.
    
    Args:
        pr_name: The PR name or title
        findings: List of finding objects with severity, title, file, line attributes
        complexity: Review complexity level (simple/medium/complex)
        source: Source of the review (UPLOAD/WEBHOOK)
        model_used: The model used for the review
        
    Returns:
        A formatted human-readable string for storage in Hindsight
    """
    # Filter findings by severity
    critical = [f for f in findings if getattr(f, 'severity', None) == 'critical']
    high = [f for f in findings if getattr(f, 'severity', None) == 'high']
    medium = [f for f in findings if getattr(f, 'severity', None) == 'medium']
    low = [f for f in findings if getattr(f, 'severity', None) == 'low']
    
    # Get unique files
    files = list(set(getattr(f, 'file', None) or getattr(f, 'file_path', None) for f in findings if getattr(f, 'file', None) or getattr(f, 'file_path', None)))
    
    # Build findings lines
    findings_lines = []
    for f in findings:
        severity = getattr(f, 'severity', 'low').upper()
        title = getattr(f, 'title', 'Unknown issue')
        file_path = getattr(f, 'file', None) or getattr(f, 'file_path', 'unknown')
        line = getattr(f, 'line', None)
        
        line_info = f" line {line}" if line else ""
        findings_lines.append(f"- [{severity}] {title} in {file_path}{line_info}")
    
    # Build the content string
    content = f"""PR: {pr_name}
Source: {source}
Complexity: {complexity}
Model: {model_used}
Files reviewed: {', '.join(files) if files else 'N/A'}
Findings: {len(findings)} total ({len(critical)} critical, {len(high)} high, {len(medium)} medium, {len(low)} low)

Issues found:
{chr(10).join(findings_lines) if findings_lines else 'No issues found.'}
"""
    return content.strip()


def build_memory_metadata(
    pr_name: str,
    source: str,
    complexity: str,
    model_used: str,
    findings: list
) -> dict:
    """
    Build clean metadata dict for memory storage.
    
    Args:
        pr_name: The PR name or title
        source: Source of the review (UPLOAD/WEBHOOK)
        complexity: Review complexity level
        model_used: The model used for the review
        findings: List of finding objects
        
    Returns:
        A clean metadata dictionary
    """
    critical = [f for f in findings if getattr(f, 'severity', None) == 'critical']
    high = [f for f in findings if getattr(f, 'severity', None) == 'high']
    medium = [f for f in findings if getattr(f, 'severity', None) == 'medium']
    low = [f for f in findings if getattr(f, 'severity', None) == 'low']
    
    files = list(set(getattr(f, 'file', None) or getattr(f, 'file_path', None) for f in findings if getattr(f, 'file', None) or getattr(f, 'file_path', None)))
    
    return {
        "pr_name": pr_name,
        "source": source,
        "complexity": complexity,
        "model_used": model_used,
        "total_findings": len(findings),
        "critical_count": len(critical),
        "high_count": len(high),
        "medium_count": len(medium),
        "low_count": len(low),
        "files": files,
        "summary": findings[0].title if findings else "No issues"
    }


def parse_memory_content(content: str) -> dict:
    """
    Parse a memory content string to extract key information.
    Used when only content string is available (no metadata).
    
    Args:
        content: The formatted memory content string
        
    Returns:
        A dictionary with extracted information
    """
    lines = content.split('\n')
    result = {
        'pr_name': '',
        'source': '',
        'complexity': '',
        'model_used': '',
        'files': [],
        'findings': []
    }
    
    in_issues_section = False
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        if line.startswith('PR:'):
            result['pr_name'] = line.replace('PR:', '').strip()
        elif line.startswith('Source:'):
            result['source'] = line.replace('Source:', '').strip()
        elif line.startswith('Complexity:'):
            result['complexity'] = line.replace('Complexity:', '').strip()
        elif line.startswith('Model:'):
            result['model_used'] = line.replace('Model:', '').strip()
        elif line.startswith('Files reviewed:'):
            files_str = line.replace('Files reviewed:', '').strip()
            if files_str != 'N/A':
                result['files'] = [f.strip() for f in files_str.split(',')]
        elif line.startswith('Findings:'):
            # Parse counts from findings line
            pass
        elif line == 'Issues found:':
            in_issues_section = True
        elif in_issues_section and line.startswith('- ['):
            result['findings'].append(line)
    
    return result
