import { useState } from 'react';

function formatRelativeTime(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  return date.toLocaleDateString();
}

function parseMemoryData(memory) {
  // Prefer metadata if available
  const metadata = memory.metadata || {};
  
  if (Object.keys(metadata).length > 0) {
    return {
      prName: metadata.pr_name || memory.title || 'Unknown PR',
      source: metadata.source || 'UPLOAD',
      complexity: metadata.complexity || 'SIMPLE',
      modelUsed: metadata.model_used || 'unknown',
      totalFindings: metadata.total_findings || 0,
      criticalCount: metadata.critical_count || 0,
      highCount: metadata.high_count || 0,
      mediumCount: metadata.medium_count || 0,
      lowCount: metadata.low_count || 0,
      files: metadata.files || [],
      summary: metadata.summary || '',
      content: memory.content || memory.summary || '',
    };
  }
  
  // Parse from content string as fallback
  const content = memory.content || memory.summary || '';
  const lines = content.split('\n');
  
  const parsed = {
    prName: memory.title || 'Unknown PR',
    source: 'UPLOAD',
    complexity: 'SIMPLE',
    modelUsed: 'unknown',
    totalFindings: 0,
    criticalCount: 0,
    highCount: 0,
    mediumCount: 0,
    lowCount: 0,
    files: [],
    summary: '',
    content: content,
  };
  
  let inIssuesSection = false;
  const findings = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    if (trimmed.startsWith('PR:')) {
      parsed.prName = trimmed.replace('PR:', '').trim();
    } else if (trimmed.startsWith('Source:')) {
      parsed.source = trimmed.replace('Source:', '').trim().toUpperCase();
    } else if (trimmed.startsWith('Complexity:')) {
      parsed.complexity = trimmed.replace('Complexity:', '').trim().toUpperCase();
    } else if (trimmed.startsWith('Model:')) {
      parsed.modelUsed = trimmed.replace('Model:', '').trim();
    } else if (trimmed.startsWith('Files reviewed:')) {
      const filesStr = trimmed.replace('Files reviewed:', '').trim();
      if (filesStr !== 'N/A') {
        parsed.files = filesStr.split(',').map(f => f.trim()).filter(f => f);
      }
    } else if (trimmed.startsWith('Findings:')) {
      const match = trimmed.match(/(\d+) total.*?\((\d+) critical.*?,(\d+) high.*?,(\d+) medium.*?,(\d+) low/);
      if (match) {
        parsed.totalFindings = parseInt(match[1]) || 0;
        parsed.criticalCount = parseInt(match[2]) || 0;
        parsed.highCount = parseInt(match[3]) || 0;
        parsed.mediumCount = parseInt(match[4]) || 0;
        parsed.lowCount = parseInt(match[5]) || 0;
      }
    } else if (trimmed === 'Issues found:') {
      inIssuesSection = true;
    } else if (inIssuesSection && trimmed.startsWith('- [')) {
      findings.push(trimmed);
    }
  }
  
  parsed.findings = findings;
  return parsed;
}

function extractIssuesFromContent(content) {
  if (!content) return [];
  const lines = content.split('\n');
  const issues = [];
  let inIssuesSection = false;
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === 'Issues found:') {
      inIssuesSection = true;
      continue;
    }
    if (inIssuesSection && trimmed.startsWith('- [')) {
      // Clean up the issue line - remove the leading dash and brackets
      const cleanLine = trimmed
        .replace(/^- \[/, '')
        .replace(/\] /, ' ')
        .replace(/- \[CRITICAL\]/i, '')
        .replace(/- \[HIGH\]/i, '')
        .replace(/- \[MEDIUM\]/i, '')
        .replace(/- \[LOW\]/i, '');
      issues.push(cleanLine.trim());
    }
  }
  
  return issues;
}

export function MemoryCard({ memory, onClick }) {
  const [showAllIssues, setShowAllIssues] = useState(false);
  
  const data = parseMemoryData(memory);
  const issues = extractIssuesFromContent(data.content);
  const displayIssues = showAllIssues ? issues : issues.slice(0, 2);
  const hasMoreIssues = issues.length > 2;
  
  const complexityColors = {
    COMPLEX: { bg: 'rgba(220, 38, 38, 0.15)', color: '#fca5a5' },
    MEDIUM: { bg: 'rgba(234, 179, 8, 0.15)', color: '#fde047' },
    SIMPLE: { bg: 'rgba(34, 197, 94, 0.15)', color: '#86efac' },
  };
  
  const complexityStyle = complexityColors[data.complexity] || complexityColors.SIMPLE;
  
  const severityConfig = {
    critical: { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'rgba(239, 68, 68, 0.2)' },
    high: { bg: 'rgba(249, 115, 22, 0.1)', color: '#f97316', border: 'rgba(249, 115, 22, 0.2)' },
    medium: { bg: 'rgba(234, 179, 8, 0.1)', color: '#eab308', border: 'rgba(234, 179, 8, 0.2)' },
    low: { bg: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', border: 'rgba(34, 197, 94, 0.2)' },
  };
  
  return (
    <article 
      className="memory-card-v2"
      onClick={() => onClick && onClick(memory)}
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        padding: '20px 24px',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255, 77, 143, 0.25)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Header Row */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        {/* Left side - Source badge and PR name */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{
            fontSize: '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            background: 'rgba(255, 77, 143, 0.08)',
            border: '1px solid rgba(255, 77, 143, 0.2)',
            color: '#ff4d8f',
            padding: '3px 10px',
            borderRadius: '20px',
            fontWeight: 600,
          }}>
            {data.source}
          </span>
          <span style={{
            fontSize: '15px',
            fontWeight: 600,
            color: 'white',
            marginLeft: '10px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '300px',
          }} title={data.prName}>
            {data.prName}
          </span>
        </div>
        
        {/* Right side - Complexity badge */}
        <span style={{
          background: complexityStyle.bg,
          color: complexityStyle.color,
          borderRadius: '6px',
          padding: '3px 10px',
          fontSize: '11px',
          fontWeight: 500,
          textTransform: 'uppercase',
        }}>
          {data.complexity}
        </span>
      </div>
      
      {/* Severity Row */}
      {(data.criticalCount > 0 || data.highCount > 0 || data.mediumCount > 0 || data.lowCount > 0) && (
        <div style={{
          display: 'flex',
          gap: '12px',
          marginTop: '12px',
          flexWrap: 'wrap',
        }}>
          {data.criticalCount > 0 && (
            <span style={{
              background: severityConfig.critical.bg,
              color: severityConfig.critical.color,
              border: `1px solid ${severityConfig.critical.border}`,
              fontSize: '12px',
              padding: '3px 10px',
              borderRadius: '20px',
            }}>
              {data.criticalCount} Critical
            </span>
          )}
          {data.highCount > 0 && (
            <span style={{
              background: severityConfig.high.bg,
              color: severityConfig.high.color,
              border: `1px solid ${severityConfig.high.border}`,
              fontSize: '12px',
              padding: '3px 10px',
              borderRadius: '20px',
            }}>
              {data.highCount} High
            </span>
          )}
          {data.mediumCount > 0 && (
            <span style={{
              background: severityConfig.medium.bg,
              color: severityConfig.medium.color,
              border: `1px solid ${severityConfig.medium.border}`,
              fontSize: '12px',
              padding: '3px 10px',
              borderRadius: '20px',
            }}>
              {data.mediumCount} Medium
            </span>
          )}
          {data.lowCount > 0 && (
            <span style={{
              background: severityConfig.low.bg,
              color: severityConfig.low.color,
              border: `1px solid ${severityConfig.low.border}`,
              fontSize: '12px',
              padding: '3px 10px',
              borderRadius: '20px',
            }}>
              {data.lowCount} Low
            </span>
          )}
        </div>
      )}
      
      {/* Files Row */}
      {data.files.length > 0 && (
        <div style={{ marginTop: '10px' }}>
          <span style={{
            fontSize: '11px',
            color: 'rgba(255, 255, 255, 0.35)',
            marginRight: '6px',
          }}>
            Files reviewed:
          </span>
          <div style={{
            display: 'inline-flex',
            flexWrap: 'wrap',
            gap: '5px',
          }}>
            {data.files.map((file, idx) => (
              <span 
                key={idx}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  fontFamily: 'monospace',
                  fontSize: '11px',
                  color: 'rgba(255, 255, 255, 0.6)',
                  padding: '2px 8px',
                  borderRadius: '4px',
                }}
              >
                {file}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* Issues Preview */}
      {displayIssues.length > 0 && (
        <div style={{ marginTop: '12px' }}>
          {displayIssues.map((issue, idx) => (
            <div 
              key={idx}
              style={{
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.55)',
                fontFamily: 'monospace',
                lineHeight: '1.7',
                display: 'flex',
                alignItems: 'flex-start',
              }}
            >
              <span style={{ marginRight: '6px', color: '#ff4d8f' }}>→</span>
              <span>{issue}</span>
            </div>
          ))}
          {hasMoreIssues && !showAllIssues && (
            <button
              onClick={() => setShowAllIssues(true)}
              style={{
                fontSize: '11px',
                color: 'rgba(255, 77, 143, 0.7)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px 0',
                marginTop: '4px',
              }}
            >
              + {issues.length - 2} more findings
            </button>
          )}
        </div>
      )}
      
      {/* Footer Row */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '14px',
        paddingTop: '12px',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
      }}>
        <span style={{
          fontFamily: 'monospace',
          fontSize: '11px',
          color: 'rgba(255, 255, 255, 0.3)',
        }}>
          {data.modelUsed}
        </span>
        <span style={{
          fontSize: '11px',
          color: 'rgba(255, 255, 255, 0.3)',
        }}>
          {formatRelativeTime(memory.created_at)}
        </span>
      </div>
    </article>
  );
}
