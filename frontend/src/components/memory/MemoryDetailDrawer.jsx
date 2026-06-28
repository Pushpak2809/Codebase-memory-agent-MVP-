import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

function formatRelativeTime(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

function parseMemoryData(memory) {
  const metadata = memory.metadata || {};
  
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
    costUsd: metadata.cost_usd || memory.cost_usd || 0,
    createdAt: memory.created_at,
    findings: memory.findings || metadata.findings || [],
  };
}

const severityColors = {
  critical: { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '#ef4444' },
  high: { bg: 'rgba(249, 115, 22, 0.1)', color: '#f97316', border: '#f97316' },
  medium: { bg: 'rgba(234, 179, 8, 0.1)', color: '#eab308', border: '#eab308' },
  low: { bg: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', border: '#22c55e' },
};

const complexityColors = {
  COMPLEX: { bg: 'rgba(220, 38, 38, 0.15)', color: '#fca5a5' },
  MEDIUM: { bg: 'rgba(234, 179, 8, 0.15)', color: '#fde047' },
  SIMPLE: { bg: 'rgba(34, 197, 94, 0.15)', color: '#86efac' },
};

function formatCost(cost) {
  if (!cost || cost === 0) return '< $0.001';
  return `$${cost.toFixed(3)}`;
}

function getModelShortName(model) {
  if (!model || model === 'unknown') return 'Unknown';
  if (model.includes('llama')) return model.split('-').slice(0, 2).join('-');
  if (model.includes('gpt')) return model.split('-').slice(0, 2).join('-');
  return model.length > 20 ? model.substring(0, 20) + '...' : model;
}

export function MemoryDetailDrawer({ memory, isOpen, onClose }) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  
  const data = parseMemoryData(memory || {});
  const highSeverityCount = data.criticalCount + data.highCount;
  
  const handleCopyFindings = useCallback(() => {
    if (!data.findings.length && !data.content) return;
    
    let textToCopy = '';
    if (data.findings.length > 0) {
      textToCopy = data.findings.map(f => {
        const severity = (f.severity || 'low').toUpperCase();
        const file = f.file || f.file_path || 'unknown';
        const line = f.line ? `:${f.line}` : '';
        return `[${severity}] ${f.title || 'Unknown issue'}${file ? ` in ${file}${line}` : ''}`;
      }).join('\n');
    } else {
      textToCopy = data.content;
    }
    
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [data.findings, data.content]);
  
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);
  
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);
  
  if (!isOpen || !memory) return null;
  
  const complexityStyle = complexityColors[data.complexity] || complexityColors.SIMPLE;
  
  return (
    <>
      {/* Dark Overlay */}
      <div 
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          zIndex: 999,
          opacity: isOpen ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      />
      
      {/* Drawer Panel */}
      <div
        style={{
          position: 'fixed',
          right: 0,
          top: 0,
          bottom: 0,
          width: '100%',
          maxWidth: '520px',
          background: '#111318',
          borderLeft: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '-20px 0 60px rgba(0,0,0,0.5)',
          zIndex: 1000,
          padding: '32px',
          overflowY: 'auto',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '24px',
            right: '24px',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)',
            border: 'none',
            color: 'rgba(255,255,255,0.5)',
            fontSize: '18px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
            e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
            e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
          }}
        >
          ×
        </button>
        
        {/* Header */}
        <div style={{ marginTop: '8px' }}>
          {/* Source + PR Name */}
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
              fontSize: '18px',
              fontWeight: 600,
              color: 'white',
              marginLeft: '10px',
            }}>
              {data.prName}
            </span>
          </div>
          
          {/* Complexity + Model + Timestamp */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginTop: '10px',
            gap: '10px'
          }}>
            <span style={{
              background: complexityStyle.bg,
              color: complexityStyle.color,
              borderRadius: '6px',
              padding: '2px 8px',
              fontSize: '10px',
              fontWeight: 500,
              textTransform: 'uppercase',
            }}>
              {data.complexity}
            </span>
            <span style={{
              fontFamily: 'monospace',
              fontSize: '12px',
              color: 'rgba(255,255,255,0.35)',
            }}>
              {getModelShortName(data.modelUsed)}
            </span>
            <span style={{
              fontSize: '12px',
              color: 'rgba(255,255,255,0.25)',
              marginLeft: 'auto',
            }}>
              {formatRelativeTime(data.createdAt)}
            </span>
          </div>
        </div>
        
        {/* Divider */}
        <div style={{
          margin: '20px 0',
          height: '1px',
          background: 'rgba(255,255,255,0.07)',
        }} />
        
        {/* Summary Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '10px',
        }}>
          {/* Total Findings */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '8px',
            padding: '12px 14px',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{
              fontSize: '22px',
              fontWeight: 700,
              color: 'white',
            }}>
              {data.totalFindings}
            </div>
            <div style={{
              fontSize: '11px',
              color: 'rgba(255,255,255,0.4)',
              marginTop: '2px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Total Findings
            </div>
          </div>
          
          {/* High Severity */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '8px',
            padding: '12px 14px',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{
              fontSize: '22px',
              fontWeight: 700,
              color: highSeverityCount > 0 ? '#ef4444' : 'white',
            }}>
              {highSeverityCount}
            </div>
            <div style={{
              fontSize: '11px',
              color: 'rgba(255,255,255,0.4)',
              marginTop: '2px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              High Severity
            </div>
          </div>
          
          {/* Model */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '8px',
            padding: '12px 14px',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{
              fontSize: '16px',
              fontWeight: 600,
              color: 'white',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {getModelShortName(data.modelUsed)}
            </div>
            <div style={{
              fontSize: '11px',
              color: 'rgba(255,255,255,0.4)',
              marginTop: '2px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Model
            </div>
          </div>
          
          {/* Cost */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '8px',
            padding: '12px 14px',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{
              fontSize: '22px',
              fontWeight: 700,
              color: 'white',
            }}>
              {formatCost(data.costUsd)}
            </div>
            <div style={{
              fontSize: '11px',
              color: 'rgba(255,255,255,0.4)',
              marginTop: '2px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Cost
            </div>
          </div>
        </div>
        
        {/* Severity Pills */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginTop: '20px',
          flexWrap: 'wrap',
        }}>
          {data.criticalCount > 0 && (
            <span style={{
              background: severityColors.critical.bg,
              color: severityColors.critical.color,
              border: `1px solid ${severityColors.critical.border}`,
              fontSize: '11px',
              padding: '4px 10px',
              borderRadius: '4px',
              fontWeight: 500,
            }}>
              {data.criticalCount} Critical
            </span>
          )}
          {data.highCount > 0 && (
            <span style={{
              background: severityColors.high.bg,
              color: severityColors.high.color,
              border: `1px solid ${severityColors.high.border}`,
              fontSize: '11px',
              padding: '4px 10px',
              borderRadius: '4px',
              fontWeight: 500,
            }}>
              {data.highCount} High
            </span>
          )}
          {data.mediumCount > 0 && (
            <span style={{
              background: severityColors.medium.bg,
              color: severityColors.medium.color,
              border: `1px solid ${severityColors.medium.border}`,
              fontSize: '11px',
              padding: '4px 10px',
              borderRadius: '4px',
              fontWeight: 500,
            }}>
              {data.mediumCount} Medium
            </span>
          )}
          {data.lowCount > 0 && (
            <span style={{
              background: severityColors.low.bg,
              color: severityColors.low.color,
              border: `1px solid ${severityColors.low.border}`,
              fontSize: '11px',
              padding: '4px 10px',
              borderRadius: '4px',
              fontWeight: 500,
            }}>
              {data.lowCount} Low
            </span>
          )}
        </div>
        
        {/* Findings List */}
        {(data.findings.length > 0 || data.content) && (
          <div style={{ marginTop: '24px' }}>
            <div style={{
              fontSize: '10px',
              color: 'rgba(255,255,255,0.3)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontWeight: 600,
            }}>
              FINDINGS
            </div>
            
            {data.findings.length > 0 ? (
              data.findings.map((finding, idx) => {
                const severity = finding.severity || 'low';
                const severityStyle = severityColors[severity] || severityColors.low;
                const file = finding.file || finding.file_path;
                const line = finding.line;
                
                return (
                  <div
                    key={idx}
                    style={{
                      marginTop: '12px',
                      background: 'rgba(255,255,255,0.02)',
                      borderRadius: '8px',
                      padding: '14px 16px',
                      borderLeft: `3px solid ${severityStyle.border}`,
                    }}
                  >
                    {/* Top Row */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{
                          background: severityStyle.bg,
                          color: severityStyle.color,
                          fontSize: '10px',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                        }}>
                          {severity}
                        </span>
                        <span style={{
                          fontSize: '13px',
                          fontWeight: 500,
                          color: 'white',
                          marginLeft: '8px',
                        }}>
                          {finding.title || 'Unknown Issue'}
                        </span>
                      </div>
                      {file && (
                        <span style={{
                          fontFamily: 'monospace',
                          fontSize: '11px',
                          color: 'rgba(255,255,255,0.3)',
                        }}>
                          {file}{line ? `:${line}` : ''}
                        </span>
                      )}
                    </div>
                    
                    {/* Issue Text */}
                    {finding.issue && (
                      <div style={{
                        fontSize: '12px',
                        color: 'rgba(255,255,255,0.55)',
                        lineHeight: '1.6',
                        marginTop: '8px',
                      }}>
                        {finding.issue}
                      </div>
                    )}
                    
                    {/* Fix Text */}
                    {finding.fix && (
                      <div style={{
                        display: 'flex',
                        gap: '6px',
                        marginTop: '6px',
                      }}>
                        <span style={{
                          fontSize: '11px',
                          color: '#22c55e',
                          fontWeight: 600,
                        }}>
                          Fix:
                        </span>
                        <span style={{
                          fontSize: '11px',
                          color: 'rgba(255,255,255,0.45)',
                          lineHeight: '1.5',
                        }}>
                          {finding.fix}
                        </span>
                      </div>
                    )}
                    
                    {/* Memory Match */}
                    {(finding.memory_match || finding.memory_pr) && (
                      <div style={{
                        marginTop: '8px',
                        paddingTop: '8px',
                        borderTop: '1px solid rgba(255,255,255,0.05)',
                      }}>
                        <span style={{
                          fontSize: '10px',
                          color: '#ff4d8f',
                        }}>
                          ◆ Memory match:
                        </span>
                        <span style={{
                          fontSize: '11px',
                          color: 'rgba(255,77,143,0.7)',
                          marginLeft: '4px',
                        }}>
                          {finding.memory_match}
                        </span>
                        {finding.memory_pr && (
                          <span style={{
                            fontSize: '10px',
                            color: 'rgba(255,77,143,0.5)',
                            marginLeft: '4px',
                          }}>
                            from {finding.memory_pr}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : data.content ? (
              <pre style={{
                marginTop: '12px',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '8px',
                padding: '14px 16px',
                fontFamily: 'monospace',
                fontSize: '12px',
                color: 'rgba(255,255,255,0.55)',
                lineHeight: '1.6',
                whiteSpace: 'pre-wrap',
                overflow: 'auto',
              }}>
                {data.content}
              </pre>
            ) : null}
          </div>
        )}
        
        {/* Files Reviewed */}
        {data.files.length > 0 && (
          <div style={{ marginTop: '24px' }}>
            <div style={{
              fontSize: '10px',
              color: 'rgba(255,255,255,0.3)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontWeight: 600,
            }}>
              FILES REVIEWED
            </div>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px',
              marginTop: '8px',
            }}>
              {data.files.map((file, idx) => (
                <span
                  key={idx}
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '4px',
                    padding: '3px 10px',
                    color: 'rgba(255,255,255,0.55)',
                  }}
                >
                  {file}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Footer Actions */}
        <div style={{
          position: 'sticky',
          bottom: 0,
          background: '#111318',
          padding: '16px 0 0',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          marginTop: '32px',
          display: 'flex',
          gap: '10px',
        }}>
          <button
            onClick={handleCopyFindings}
            style={{
              background: copied 
                ? 'rgba(34, 197, 94, 0.15)' 
                : 'rgba(255,255,255,0.06)',
              border: copied
                ? '1px solid rgba(34, 197, 94, 0.3)'
                : '1px solid rgba(255,255,255,0.1)',
              color: copied ? '#22c55e' : 'rgba(255,255,255,0.7)',
              borderRadius: '8px',
              padding: '10px 18px',
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            onMouseEnter={(e) => {
              if (!copied) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (!copied) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
              }
            }}
          >
            {copied ? 'Copied ✓' : 'Copy Findings'}
          </button>
          
          <button
            onClick={() => navigate('/reviews/new')}
            style={{
              background: 'linear-gradient(135deg, #ff4d8f, #d63b7a)',
              border: 'none',
              color: 'white',
              borderRadius: '8px',
              padding: '10px 18px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'filter 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.filter = 'brightness(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.filter = 'none';
            }}
          >
            New Review →
          </button>
        </div>
      </div>
    </>
  );
}
