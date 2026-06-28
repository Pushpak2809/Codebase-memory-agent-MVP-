import {
  Activity,
  ArrowRight,
  Bell,
  Bot,
  Brain,
  Check,
  CircleDollarSign,
  Code2,
  Database,
  FileCode2,
  GitPullRequest,
  KeyRound,
  Layers3,
  Lock,
  Mail,
  Menu,
  MessageSquareCode,
  Network,
  Search,
  Settings,
  Shield,
  Upload,
  X,
  Zap,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, NavLink, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { api } from './services/api'
import { MemoryCard } from './components/memory/MemoryCard'
import { MemoryDetailDrawer } from './components/memory/MemoryDetailDrawer'

const readinessItems = [
  {
    label: 'Review pipeline',
    value: 'Ready',
    icon: GitPullRequest,
    text: 'Manual uploads and webhook reviews can run through the memory-aware analyzer.',
  },
  {
    label: 'Memory recall',
    value: 'Listening',
    icon: Brain,
    text: 'Relevant context is attached when the memory provider returns matches.',
  },
  {
    label: 'Model routing',
    value: 'Configured',
    icon: CircleDollarSign,
    text: 'Routing is prepared for fast reviews with escalation for complex changes.',
  },
  {
    label: 'Webhooks',
    value: 'Ready to connect',
    icon: Activity,
    text: 'Connect a repository when you are ready to review pull requests automatically.',
  },
]

const routingItems = [
  {
    label: 'Fast path',
    text: 'Straightforward diffs route to the low-latency provider for quick feedback.',
  },
  {
    label: 'Deep review',
    text: 'Risky auth, data, and infrastructure changes can escalate to a stronger model.',
  },
  {
    label: 'Memory assist',
    text: 'Retrieved architecture notes are included before the model writes findings.',
  },
]

function formatReviewStatus(status) {
  if (!status) return 'Complete'
  return status.replaceAll('_', ' ')
}

const pricing = [
  {
    name: 'Starter',
    price: 'Start',
    caption: 'For validating the workflow on a private repository.',
    features: ['Manual diff reviews', 'Private repository setup', 'Basic memory recall', 'Secure upload flow'],
  },
  {
    name: 'Growth',
    price: 'Scale',
    caption: 'For teams that want memory-aware review in their daily workflow.',
    features: ['Continuous reviews', 'Connected repositories', 'Full memory timeline', 'Routing dashboard', 'Team notifications'],
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    caption: 'For shared engineering memory across larger organizations.',
    features: ['Organization-wide rollout', 'Shared team memory bank', 'Priority routing', 'GitHub Action included'],
  },
]

function Logo() {
  return (
    <Link className="logo" to="/">
      <span className="logo-mark">CM</span>
      <span>Codebase Memory Agent</span>
    </Link>
  )
}

function PublicNav() {
  const [open, setOpen] = useState(false)
  const links = [
    ['How it works', '/#how'],
    ['Features', '/#features'],
    ['Use cases', '/#use-cases'],
    ['Docs', '/support'],
    ['Pricing', '/pricing'],
  ]
  return (
    <header className="nav">
      <Logo />
      <nav className={open ? 'nav-links open' : 'nav-links'}>
        {links.map(([label, href]) => (
          <a key={label} href={href} onClick={() => setOpen(false)}>
            {label}
          </a>
        ))}
      </nav>
      <div className="nav-actions">
        <Link className="button small" to="/signup">
          Learn more
        </Link>
      </div>
      <button className="icon-button mobile-only" onClick={() => setOpen(!open)} aria-label="Toggle menu">
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>
    </header>
  )
}

function LandingPage() {
  return (
    <main>
      <PublicNav />
      <section className="hero-shell">
        <div className="hero-copy reveal">
          <h1>
            Make your codebase <span>remember itself.</span>
          </h1>
          <p>
            A neural indexing agent that lives in your repository. It maps every dependency, logic
            flow, and architectural pattern to provide instant, precise context to your development
            workflow.
          </p>
          <div className="hero-actions">
            <Link className="button" to="/signup">
              Learn more
            </Link>
            <Link className="button secondary" to="/signin">
              Sign in
            </Link>
          </div>
        </div>
        <div className="code-window reveal delay-1" aria-label="Memory-grounded PR review preview">
          <div className="window-bar">
            <span />
            <span />
            <span />
            <small>src/auth/session_manager.ts</small>
          </div>
          <pre>{`export class SessionHandler {
  private registry: Map<string, Session>

  async validateToken(token: string): Promise {
    return await this.verify(token);
  }
}`}</pre>
          <div className="memory-pop">
            <strong>Memory recall</strong>
            <p>
              This method is used by the GatewayMiddleware to authorize incoming requests.
              Historical auth changes established the cache behavior used here to avoid memory leaks
              during peak traffic.
            </p>
          </div>
        </div>
      </section>
      <section className="section feature-band" id="features">
        <div className="section-head">
          <h2>Deep intelligence for scale.</h2>
          <p>Our agent indexes more than just text--it understands intent, relationships, and history.</p>
        </div>
        <div className="feature-grid">
          <Feature icon={Layers3} title="Persistent Context" text="Context that never expires. Every query builds on previous indexing for perfect accuracy." />
          <Feature icon={Network} title="Cross-repo Memory" text="Connect your entire microservice ecosystem and find connections across multiple repositories." />
          <Feature icon={Zap} title="Smart Model Routing" text="CascadeFlow routes simple style checks to free models and complex architecture reviews to premium models. Every decision logged." />
          <Feature icon={Shield} title="Cost Audit Trail" text="See exactly which model ran, what it cost, and how much you saved versus a single-model approach. Per review, per month." />
        </div>
      </section>
      <section className="section process-section-v2" id="how">
        <p className="process-eyebrow">HOW IT WORKS</p>
        <h2 className="process-heading">Three steps to smarter reviews.</h2>
        <p className="process-subtext">From PR open to memory-grounded review in under 60 seconds.</p>
        <div className="process-line-v2">
          <ProcessStepV2 label="PR" title="PR Opened" text="A developer opens a pull request. The GitHub webhook fires instantly and sends the diff to the agent." />
          <ProcessStepV2 label="◆" title="Memory Recalled" text="The agent searches Hindsight for every past bug, pattern, and architectural decision relevant to the changed files." />
          <ProcessStepV2 label="→" title="Review Posted" text="CascadeFlow routes to the right model. The agent posts a memory-grounded review comment directly on the GitHub PR." />
        </div>
      </section>
      <section 
        id="use-cases"
        style={{
          background: 'rgba(255,255,255,0.02)',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          padding: '100px 80px'
        }}
      >
        <div 
          className="before-after-inner"
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '80px',
            maxWidth: '1200px',
            margin: '0 auto'
          }}
        >
          {/* Left Column */}
          <div style={{ flex: '1', minWidth: '0' }}>
            <div style={{
              display: 'inline-block',
              background: 'rgba(255,77,143,0.08)',
              border: '1px solid rgba(255,77,143,0.2)',
              borderRadius: '20px',
              padding: '4px 14px',
              fontSize: '11px',
              color: '#ff4d8f',
              letterSpacing: '0.1em',
              fontWeight: 500,
              textTransform: 'uppercase'
            }}>
              BEFORE vs AFTER
            </div>
            
            <h2 style={{
              marginTop: '16px',
              fontSize: 'clamp(28px, 3vw, 42px)',
              fontWeight: 800,
              color: 'white',
              lineHeight: '1.15',
              letterSpacing: '-1px'
            }}>
              Generic review on session 1.<br />Memory-powered by session 5.
            </h2>
            
            <p style={{
              marginTop: '14px',
              fontSize: '15px',
              color: 'rgba(255,255,255,0.45)',
              lineHeight: '1.65',
              maxWidth: '400px'
            }}>
              Every PR your team merges teaches the agent something new. The review it writes on PR #50 is nothing like PR #1.
            </p>
            
            {/* Bullet 1 */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              marginTop: '28px'
            }}>
              <span style={{
                color: '#ff4d8f',
                fontSize: '14px',
                flexShrink: 0
              }}>✓</span>
              <span style={{
                fontSize: '14px',
                color: 'rgba(255,255,255,0.65)'
              }}>Cites exact past PRs where patterns appeared</span>
            </div>
            
            {/* Bullet 2 */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              marginTop: '12px'
            }}>
              <span style={{
                color: '#ff4d8f',
                fontSize: '14px',
                flexShrink: 0
              }}>✓</span>
              <span style={{
                fontSize: '14px',
                color: 'rgba(255,255,255,0.65)'
              }}>Warns before bugs are repeated, not after</span>
            </div>
            
            {/* Bullet 3 */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              marginTop: '12px'
            }}>
              <span style={{
                color: '#ff4d8f',
                fontSize: '14px',
                flexShrink: 0
              }}>✓</span>
              <span style={{
                fontSize: '14px',
                color: 'rgba(255,255,255,0.65)'
              }}>Cost drops as routing improves with more reviews</span>
            </div>
          </div>
          
          {/* Right Column - Cards */}
          <div style={{
            flex: '1',
            minWidth: '0',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}>
            {/* Card 1 - Before */}
            <div 
              className="feature-card"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: '14px',
                padding: '24px 28px'
              }}
            >
              <div style={{
                display: 'inline-block',
                background: 'rgba(255,255,255,0.06)',
                borderRadius: '6px',
                padding: '3px 10px',
                fontSize: '10px',
                color: 'rgba(255,255,255,0.35)',
                letterSpacing: '0.1em',
                fontWeight: 600,
                textTransform: 'uppercase'
              }}>
                SESSION 1 — NO MEMORY
              </div>
              
              <p style={{
                fontFamily: 'monospace',
                fontSize: '13px',
                color: 'rgba(255,255,255,0.5)',
                lineHeight: '1.6',
                margin: '14px 0 0'
              }}>
                ⚠ This function lacks error handling.
              </p>
              
              <p style={{
                fontSize: '11px',
                color: 'rgba(255,255,255,0.25)',
                margin: '8px 0 0'
              }}>
                Generic feedback. No context. No history.
              </p>
            </div>
            
            {/* Card 2 - After */}
            <div 
              className="feature-card"
              style={{
                background: 'rgba(255,77,143,0.05)',
                border: '1px solid rgba(255,77,143,0.22)',
                borderRadius: '14px',
                padding: '24px 28px'
              }}
            >
              <div style={{
                display: 'inline-block',
                background: 'rgba(255,77,143,0.1)',
                borderRadius: '6px',
                padding: '3px 10px',
                fontSize: '10px',
                color: '#ff4d8f',
                letterSpacing: '0.1em',
                fontWeight: 600,
                textTransform: 'uppercase'
              }}>
                SESSION 5 — MEMORY ACTIVE
              </div>
              
              <p style={{
                fontFamily: 'monospace',
                fontSize: '12px',
                color: 'rgba(255,255,255,0.75)',
                lineHeight: '1.75',
                margin: '14px 0 0',
                whiteSpace: 'pre-line'
              }}>
                🧠 [CRITICAL] This auth pattern matches the{'\n'}race condition in PR #23 (Oct 2024).{'\n'}Your team's fix was to use a distributed{'\n'}lock — see session_manager.ts line 47.
              </p>
              
              <p style={{
                fontSize: '11px',
                color: 'rgba(255,77,143,0.7)',
                margin: '10px 0 0',
                fontWeight: 500
              }}>
                Memory-grounded. Specific. Actionable.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="section cta-section">
        <h2>Ready to upgrade your repository's IQ?</h2>
        <p>Give every review the context your team has already earned.</p>
        <div className="hero-actions">
          <Link className="button" to="/signup">Get started free</Link>
          <Link className="button secondary" to="/support">Contact sales</Link>
        </div>
      </section>
      <Footer />
    </main>
  )
}

function Feature({ icon: Icon, title, text }) {
  return (
    <article className="feature-card">
      <Icon size={22} />
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  )
}

function ProcessStep({ label, title, text }) {
  return (
    <article className="process-step">
      <span>{label}</span>
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  )
}

function ProcessStepV2({ label, title, text }) {
  return (
    <article className="process-step-v2">
      <span>{label}</span>
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  )
}

function PricingCards() {
  return (
    <div className="pricing-grid">
      {pricing.map((plan) => (
        <article className={plan.highlighted ? 'price-card highlighted' : 'price-card'} key={plan.name}>
          <h3>{plan.name}</h3>
          <div className="price">
            {plan.price}
          </div>
          <p>{plan.caption}</p>
          <ul>
            {plan.features.map((feature) => (
              <li key={feature}>
                <Check size={15} />
                {feature}
              </li>
            ))}
          </ul>
          <Link className={plan.highlighted ? 'button' : 'button secondary'} to="/signup">
            Join waitlist
          </Link>
        </article>
      ))}
    </div>
  )
}

function Footer() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  
  const handleNewsletter = (e) => {
    e.preventDefault()
    if (email.trim()) setSubscribed(true)
  }

  const footerLinks = {
    Product: ['Features', 'Pricing', 'Integrations', 'Changelog', 'Roadmap'],
    Resources: ['Documentation', 'API Reference', 'Community', 'Blog', 'Status'],
    Company: ['About', 'Careers', 'Press', 'Contact', 'Support'],
    Legal: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Security']
  }

  const getLinkPath = (link) => {
    if (link === 'Privacy Policy') return '/privacy'
    if (link === 'Terms of Service') return '/terms'
    if (link === 'Cookie Policy') return '/cookies'
    return '/support'
  }

  return (
    <footer className="footer-v2">
      {/* Newsletter Strip */}
      <div className="footer-newsletter-strip">
        <div className="footer-newsletter-content">
          <div className="footer-newsletter-text">
            <h3>Stay ahead of every review.</h3>
            <p>Engineering memory updates and product news delivered weekly.</p>
          </div>
          <form className="footer-newsletter-form" onSubmit={handleNewsletter}>
            {subscribed ? (
              <span className="footer-subscribed">
                <Check size={16} /> Subscribed — check your inbox.
              </span>
            ) : (
              <>
                <input 
                  type="email" 
                  placeholder="developer@company.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                />
                <button type="submit">Subscribe</button>
              </>
            )}
          </form>
        </div>
      </div>

      {/* Main Footer */}
      <div className="footer-main-v2">
        {/* Column 1 - Brand */}
        <div className="footer-brand-col">
          <div className="footer-logo-row">
            <span className="footer-logo-mark">CM</span>
            <span className="footer-logo-text">Codebase Memory Agent</span>
          </div>
          <p className="footer-tagline">
            Building the next generation of neural-aware development tools for high-performance engineering teams.
          </p>
          <div className="footer-badges">
            <span className="footer-tech-badge">⚡ Powered by CascadeFlow</span>
            <span className="footer-tech-badge">◆ Memory by Hindsight</span>
          </div>
          <div className="footer-social-v2">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
          </div>
        </div>

        {/* Columns 2-5 - Link Columns */}
        {Object.entries(footerLinks).map(([title, links]) => (
          <div className="footer-link-col" key={title}>
            <h4 className="footer-col-heading">{title}</h4>
            <ul className="footer-link-list">
              {links.map((link) => (
                <li key={link}>
                  <Link to={getLinkPath(link)}>{link}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom-v2">
        <span className="footer-copyright">© 2026 Codebase Memory Agent. All rights reserved.</span>
        <div className="footer-bottom-links-v2">
          <Link to="/privacy">Privacy</Link>
          <span>·</span>
          <Link to="/terms">Terms</Link>
          <span>·</span>
          <Link to="/cookies">Cookies</Link>
        </div>
      </div>
    </footer>
  )
}

function AuthPage({ mode }) {
  const navigate = useNavigate()
  const isSignup = mode === 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const submit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const result = isSignup ? await api.signup(email, password) : await api.signin(email, password)
      localStorage.setItem('cma_session', result.access_token)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }
  const githubSignin = () => {
    window.location.href = api.githubOAuthUrl
  }
  return (
    <main className="auth-page">
      <Link className="auth-brand" to="/">
        <Logo />
      </Link>
      <section className="auth-left">
        <div>
          <span className="logo-mark large">CM</span>
          <h1>Securely access your memory-enabled agent.</h1>
          <p>The high-performance workspace for codebase architecture and AI-driven memory management.</p>
        </div>
      </section>
      <section className="auth-panel">
        <form className="auth-form" onSubmit={submit}>
          <p className="eyebrow">Secure access</p>
          <h2>{isSignup ? 'Create account' : 'Sign in'}</h2>
          <p className="muted">
            {isSignup ? 'Connect your engineering workspace to CMA.' : 'Welcome back, developer. Enter your credentials.'}
          </p>
          <label>
            Email address
            <span className="input-wrap">
              <Mail size={16} />
              <input required type="email" placeholder="dev@company.com" value={email} onChange={(event) => setEmail(event.target.value)} />
            </span>
          </label>
          <label>
            Password
            <span className="input-wrap">
              <Lock size={16} />
              <input required type="password" placeholder="Minimum 8 characters" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} />
            </span>
          </label>
          {error && <p className="form-error">{error}</p>}
          <button className="button full" type="submit">
            {busy ? 'Connecting...' : isSignup ? 'Create workspace' : 'Sign in'} <ArrowRight size={17} />
          </button>
          <button className="button secondary full" type="button" onClick={githubSignin}>
            <Code2 size={17} />
            Continue with GitHub
          </button>
          <p className="switch-auth">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
            <Link to={isSignup ? '/signin' : '/signup'}>{isSignup ? 'Sign in' : 'Sign up'}</Link>
          </p>
        </form>
      </section>
    </main>
  )
}

function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    if (token) {
      localStorage.setItem('cma_session', token)
      navigate('/dashboard', { replace: true })
      return
    }
    navigate('/signin?error=github_oauth_failed', { replace: true })
  }, [navigate])

  return (
    <main className="auth-page">
      <section className="auth-panel full-panel">
        <div className="auth-form">
          <p className="eyebrow">GitHub OAuth</p>
          <h2>Connecting workspace</h2>
          <p className="muted">Completing sign-in and opening your dashboard.</p>
        </div>
      </section>
    </main>
  )
}
function Protected({ children }) {
  const authed = Boolean(localStorage.getItem('cma_session'))
  return authed ? children : <Navigate to="/signin" replace />
}

function AppShell({ children }) {
  const navigate = useNavigate()
  const nav = [
    ['Dashboard', '/dashboard', Activity],
    ['New Review', '/reviews/new', Upload],
    ['Reviews', '/reviews', GitPullRequest],
    ['Memory', '/memory', Brain],
    ['Cost', '/cost', CircleDollarSign],
    ['Settings', '/settings', Settings],
  ]
  const signOut = () => {
    localStorage.removeItem('cma_session')
    navigate('/')
  }
  return (
    <main className="app-shell">
      <aside className="sidebar">
        <Logo />
        <nav>
          {nav.map(([label, href, Icon]) => (
            <NavLink key={href} to={href}>
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <button className="button secondary full" onClick={signOut}>Sign out</button>
      </aside>
      <section className="workspace">{children}</section>
      <nav className="bottom-tabs">
        {nav.slice(0, 5).map(([label, href, Icon]) => (
          <NavLink key={href} to={href} aria-label={label}>
            <Icon size={20} />
          </NavLink>
        ))}
      </nav>
    </main>
  )
}

function DashboardHome() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    api.listReviews()
      .then((data) => {
        if (mounted) setReviews(data.reviews || [])
      })
      .catch((err) => {
        if (mounted) setError(err.message)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [])

  const dashboardItems = [
    {
      label: 'Reviews completed',
      value: loading ? '...' : String(reviews.length),
      icon: GitPullRequest,
      text: error
        ? 'Review history is temporarily unavailable.'
        : reviews.length
          ? 'Completed diff reviews are being tracked for this workspace.'
          : 'Run a diff review to start building workspace activity.',
    },
    ...readinessItems.slice(1),
  ]

  return (
    <AppShell>
      <PageHeader eyebrow="Workspace" title="Review memory, model routing, and pull-request context." text="CMA is ready for webhook PRs or manual diff uploads. Workspace activity appears after the first live review." />
      <div className="status-grid">
        {dashboardItems.map((item) => (
          <StatusCard key={item.label} {...item} />
        ))}
      </div>
      <div className="dash-grid">
        <RecentReviews reviews={reviews} loading={loading} error={error} />
        <CostMini />
      </div>
    </AppShell>
  )
}

function PageHeader({ eyebrow, title, text }) {
  return (
    <header className="page-header">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      {text && <p>{text}</p>}
    </header>
  )
}

function StatusCard({ label, value, text, icon: Icon }) {
  return (
    <article className="status-card">
      <div>
        <Icon size={20} />
        <span>{label}</span>
      </div>
      <strong>{value}</strong>
      <p>{text}</p>
    </article>
  )
}

function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <div className="empty-state">
      <Icon size={22} />
      <h3>{title}</h3>
      <p>{text}</p>
      {action}
    </div>
  )
}

function RecentReviews({ reviews = [], loading = false, error = '' }) {
  return (
    <section className="panel">
      <div className="panel-head">
        <h2>Recent reviews</h2>
        <Link to="/reviews">View all</Link>
      </div>
      {loading ? (
        <EmptyState icon={GitPullRequest} title="Loading review activity" text="Checking the workspace for live review records." />
      ) : error ? (
        <EmptyState icon={GitPullRequest} title="Reviews unavailable" text={error} />
      ) : reviews.length ? (
        <div className="review-list">
          {reviews.map((review) => (
            <Link className="review-row" key={review.id || review.title} to={review.id ? `/reviews/${review.id}` : '/reviews'}>
              <div>
                <strong>{review.title || 'Review completed'}</strong>
                <span>{[review.repo, review.source, formatReviewStatus(review.status)].filter(Boolean).join(' - ')}</span>
              </div>
              <em className={`severity ${review.severity || 'low'}`}>{formatReviewStatus(review.status)}</em>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Upload}
          title="No reviews yet"
          text="Upload a diff or connect a repository to start building review history."
          action={<Link className="button secondary" to="/reviews/new">Start a review</Link>}
        />
      )}
    </section>
  )
}

function CostMini() {
  return (
    <section className="panel">
      <div className="panel-head">
        <h2>Routing policy</h2>
        <Link to="/cost">Review settings</Link>
      </div>
      <div className="route-list">
        {routingItems.map((item) => (
          <article className="route-item" key={item.label}>
            <span>{item.label}</span>
            <p>{item.text}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

const DIFF_FILE_EXTENSIONS = ['.diff', '.patch', '.txt']
const MAX_DIFF_UPLOAD_BYTES = 5 * 1024 * 1024

function isDiffFile(file) {
  const name = file.name.toLowerCase()
  return DIFF_FILE_EXTENSIONS.some((extension) => name.endsWith(extension))
}

async function readDiffFiles(fileList, sourceType) {
  const files = Array.from(fileList || [])
    .filter(isDiffFile)
    .sort((a, b) => (a.webkitRelativePath || a.name).localeCompare(b.webkitRelativePath || b.name))

  if (!files.length) {
    throw new Error('Select a .diff, .patch, or .txt file.')
  }

  const totalBytes = files.reduce((sum, file) => sum + file.size, 0)
  if (totalBytes > MAX_DIFF_UPLOAD_BYTES) {
    throw new Error('Selected diff content is over the 5MB limit.')
  }

  const parts = await Promise.all(
    files.map(async (file) => {
      const sourceName = file.webkitRelativePath || file.name
      const content = await file.text()
      return sourceType === 'folder' ? `diff --source ${sourceName}\n${content}` : content
    }),
  )

  return {
    text: parts.join('\n\n'),
    label: sourceType === 'folder' ? `${files.length} diff file${files.length === 1 ? '' : 's'} from folder` : files[0].name,
  }
}

function NewReviewPage() {
  const [result, setResult] = useState(null)
  const [busy, setBusy] = useState(false)
  const [diffText, setDiffText] = useState('')
  const [error, setError] = useState('')
  const [selectedLabel, setSelectedLabel] = useState('No file selected')
  const [dragging, setDragging] = useState(false)
  const fileInputRef = useRef(null)
  const folderInputRef = useRef(null)
  const textareaRef = useRef(null)

  const applyFiles = async (fileList, sourceType = 'file') => {
    setError('')
    try {
      const selection = await readDiffFiles(fileList, sourceType)
      setDiffText(selection.text)
      setSelectedLabel(selection.label)
      setResult(null)
    } catch (err) {
      setError(err.message)
    }
  }

  const analyze = async (event) => {
    event.preventDefault()
    const diff = diffText.trim()
    if (!diff) {
      setError('Paste a diff or select a .diff, .patch, or .txt file first.')
      return
    }

    setBusy(true)
    setError('')
    try {
      const uploadName = selectedLabel === 'No file selected' ? 'manual-diff.txt' : selectedLabel
      const safeUploadName = /\.(diff|patch|txt)$/i.test(uploadName) ? uploadName : `${uploadName}.txt`
      const response = await api.uploadDiff(new File([diff], safeUploadName, { type: 'text/plain' }))
      setResult(response)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <AppShell>
      <PageHeader eyebrow="New review" title="Upload a diff or paste raw changes." text="The same memory and model-routing pipeline runs for webhook and manual reviews." />
      <form className="review-form panel" onSubmit={analyze}>
        <div className="method-grid">
          <button type="button" className="method-card active" onClick={() => fileInputRef.current?.click()}><Upload size={20} /> Upload .diff / .patch</button>
          <button type="button" className="method-card" onClick={() => textareaRef.current?.focus()}><FileCode2 size={20} /> Paste raw diff</button>
          <button type="button" className="method-card" onClick={() => folderInputRef.current?.click()}><Layers3 size={20} /> Folder browse</button>
        </div>
        <label
          className={dragging ? 'drop-zone dragging' : 'drop-zone'}
          onDragOver={(event) => {
            event.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault()
            setDragging(false)
            applyFiles(event.dataTransfer.files)
          }}
        >
          <Upload size={26} />
          <strong>Select or drag a diff file</strong>
          <span>.diff, .patch, or .txt up to 5MB</span>
          <input ref={fileInputRef} type="file" accept=".diff,.patch,.txt" onChange={(event) => applyFiles(event.target.files)} />
        </label>
        <input
          ref={folderInputRef}
          className="hidden-input"
          type="file"
          accept=".diff,.patch,.txt"
          multiple
          webkitdirectory=""
          directory=""
          onChange={(event) => applyFiles(event.target.files, 'folder')}
        />
        <p className="file-hint">{selectedLabel}</p>
        <label>
          Paste diff text
          <textarea ref={textareaRef} placeholder="diff --git a/src/auth.ts b/src/auth.ts" rows="9" value={diffText} onChange={(event) => {
            setDiffText(event.target.value)
            setSelectedLabel(event.target.value ? 'Pasted diff text' : 'No file selected')
          }} />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button className="button" type="submit" disabled={busy}>
          {busy ? 'Analyzing PR...' : 'Analyze changes'} <Bot size={17} />
        </button>
      </form>
      {result && (
        <section className="panel result-panel">
          <h2>Review complete</h2>
          {(() => {
            const rawCandidates = [result.summary, ...(result.findings || []).map((finding) => finding.detail)].filter((value) => typeof value === 'string')
            const parsed = rawCandidates.reduce((current, value) => {
              if (current) return current
              const clean = value.trim().replace(/^```(?:json)?\s*/i, '').replace(/```$/i, '').trim()
              try {
                return JSON.parse(clean)
              } catch {
                return null
              }
            }, null)
            const parsedFindings = Array.isArray(parsed?.findings) ? parsed.findings : []
            const severityCounts = parsedFindings.reduce((counts, finding) => {
              const severity = finding.severity || 'low'
              return { ...counts, [severity]: (counts[severity] || 0) + 1 }
            }, { critical: 0, high: 0, medium: 0, low: 0 })
            const severityColor = { critical: '#dc2626', high: '#f97316', medium: '#ca8a04', low: '#16a34a' }

            return (
              <div className="review-findings">
                <div className="status-grid">
                  {['critical', 'high', 'medium', 'low'].map((severity) => (
                    <div className="status-card" key={severity}>
                      <span style={{ color: severityColor[severity], fontWeight: 800, textTransform: 'uppercase' }}>{severity}</span>
                      <strong>{severityCounts[severity] || 0}</strong>
                    </div>
                  ))}
                </div>
                {parsedFindings.length ? parsedFindings.map((finding) => {
                  const severity = finding.severity || 'low'
                  return (
                    <article className="memory-card" key={finding.id || `${finding.file}-${finding.title}`}>
                      <span style={{ background: severityColor[severity], color: '#fff', border: 0 }}>{severity}</span>
                      <h3>{finding.title}</h3>
                      <code>{finding.file || 'unknown file'}{finding.line != null ? `:${finding.line}` : ''}</code>
                      <p>{finding.issue}</p>
                      {finding.memory_match && (
                        <div className="memory-citation">
                          <span>Memory match</span>
                          <p>{finding.memory_match}{finding.memory_pr ? ` (${finding.memory_pr})` : ''}</p>
                        </div>
                      )}
                      <details>
                        <summary>Fix</summary>
                        <pre>{finding.fix}</pre>
                      </details>
                    </article>
                  )
                }) : (
                  <div className="memory-card">
                    <span>Findings</span>
                    <h3>{parsed?.summary_line || 'No structured findings'}</h3>
                    <p>{parsed ? 'No issues were reported in the parsed findings JSON.' : result.summary}</p>
                  </div>
                )}
              </div>
            )
          })()}
          <Link className="button secondary" to="/dashboard">View dashboard count</Link>
          {(result.citations || []).map((citation) => (
            <div className="memory-citation" key={`${citation.source}-${citation.title}`}>
              <span>Recalled memory</span>
              <strong>{citation.title}</strong>
              <p>{citation.summary || citation.source}</p>
            </div>
          ))}
        </section>
      )}
    </AppShell>
  )
}
function ReviewsPage() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    api.listReviews()
      .then((data) => {
        if (mounted) setReviews(data.reviews || [])
      })
      .catch((err) => {
        if (mounted) setError(err.message)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [])

  return (
    <AppShell>
      <PageHeader eyebrow="Reviews" title="Reviewed pull requests and uploaded diffs." />
      <RecentReviews reviews={reviews} loading={loading} error={error} />
    </AppShell>
  )
}

function ReviewDetailPage() {
  const { id } = useParams()
  const [review, setReview] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    api.getReview(id)
      .then((data) => {
        if (mounted) setReview(data)
      })
      .catch((err) => {
        if (mounted) setError(err.message)
      })
    return () => {
      mounted = false
    }
  }, [id])

  return (
    <AppShell>
      <PageHeader eyebrow="Review" title="Review details" text="Saved findings and memory citations appear here once live review storage is connected." />
      <section className="panel">
        <h2>Status</h2>
        {error ? (
          <p className="form-error">{error}</p>
        ) : (
          <EmptyState
            icon={GitPullRequest}
            title={review?.status ? formatReviewStatus(review.status) : 'Loading review'}
            text="Run a new upload review to see generated findings immediately."
            action={<Link className="button secondary" to="/reviews/new">Open review uploader</Link>}
          />
        )}
      </section>
    </AppShell>
  )
}

function MemoryPage() {
  const [query, setQuery] = useState('')
  const [memories, setMemories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedMemory, setSelectedMemory] = useState(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  useEffect(() => {
    let mounted = true
    api.listMemory()
      .then((data) => {
        if (mounted) setMemories(data.memories || [])
      })
      .catch((err) => {
        if (mounted) setError(err.message)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [])

  const filtered = useMemo(
    () => memories.filter((m) => {
      const metadata = m.metadata || {}
      const searchText = `
        ${m.title || ''} 
        ${m.pr_name || metadata.pr_name || ''} 
        ${m.source || metadata.source || ''} 
        ${m.summary || metadata.summary || ''}
        ${(metadata.files || []).join(' ')}
        ${(m.tags || []).join(' ')}
      `.toLowerCase()
      return searchText.includes(query.toLowerCase())
    }),
    [memories, query],
  )

  const handleCardClick = (memory) => {
    setSelectedMemory(memory)
    setIsDrawerOpen(true)
  }

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false)
    setTimeout(() => setSelectedMemory(null), 300)
  }

  return (
    <>
      <AppShell>
        <PageHeader 
          eyebrow="Memory timeline" 
          title="Team knowledge retained by CMA." 
          text="Every PR review builds your team's institutional memory." 
        />
        
        <label className="search-box" style={{ marginBottom: '24px' }}>
          <Search size={17} />
          <input 
            value={query} 
            onChange={(event) => setQuery(event.target.value)} 
            placeholder="Search across PR names, files, and issue titles..." 
          />
        </label>
        
        {loading ? (
          <section className="panel">
            <EmptyState icon={Brain} title="Loading memory" text="Checking the connected memory bank." />
          </section>
        ) : error ? (
          <section className="panel">
            <EmptyState icon={Brain} title="Memory unavailable" text={error} />
          </section>
        ) : filtered.length ? (
          <div className="memory-grid-v2">
            {filtered.map((memory) => (
              <MemoryCard 
                key={memory.id || memory.title || Math.random()} 
                memory={memory} 
                onClick={handleCardClick}
              />
            ))}
          </div>
        ) : (
          <section className="panel" style={{ textAlign: 'center', padding: '60px 40px' }}>
            <Brain size={48} style={{ color: 'rgba(255, 77, 143, 0.5)', marginBottom: '20px' }} />
            <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px', color: 'white' }}>
              No memory entries yet.
            </h3>
            <p style={{ fontSize: '15px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '24px' }}>
              Upload a PR diff to run your first review.
            </p>
            <Link className="button" to="/reviews/new" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              New Review →
            </Link>
          </section>
        )}
      </AppShell>
      
      <MemoryDetailDrawer 
        memory={selectedMemory} 
        isOpen={isDrawerOpen} 
        onClose={handleCloseDrawer} 
      />
    </>
  )
}

function CostPage() {
  return (
    <AppShell>
      <div style={{ 
        padding: '40px 48px',
        maxWidth: '100%',
        overflowX: 'hidden',
        boxSizing: 'border-box'
      }}>
        {/* Page Header */}
        <header style={{ marginBottom: '28px' }}>
          <p style={{
            color: '#ff4d8f',
            fontFamily: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            margin: '0 0 8px'
          }}>Cost dashboard</p>
          <h1 style={{
            fontSize: 'clamp(24px, 4vw, 52px)',
            fontWeight: 800,
            lineHeight: '1.1',
            wordBreak: 'break-word',
            maxWidth: '100%',
            margin: '0 0 10px',
            color: 'white'
          }}>Model routing and spend visibility.</h1>
          <p style={{
            fontSize: 'clamp(13px, 2vw, 16px)',
            maxWidth: '100%',
            lineHeight: '1.6',
            color: 'rgba(255,255,255,0.45)',
            margin: 0
          }}>Usage and spend details appear after production reviews start flowing through the router.</p>
        </header>
        
        {/* Stat Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          marginBottom: '28px',
          maxWidth: '100%'
        }} className="cost-status-grid">
          <div style={{
            minWidth: 0,
            wordBreak: 'break-word',
            overflow: 'hidden'
          }}>
            <StatusCard label="Budget guardrails" value="Ready" icon={Shield} text="Workspace limits can be enforced before broad rollout." />
          </div>
          <div style={{
            minWidth: 0,
            wordBreak: 'break-word',
            overflow: 'hidden'
          }}>
            <StatusCard label="Escalation policy" value="Configured" icon={Zap} text="Complex diffs can move to a deeper review path when needed." />
          </div>
          <div style={{
            minWidth: 0,
            wordBreak: 'break-word',
            overflow: 'hidden'
          }}>
            <StatusCard label="Provider mix" value="Flexible" icon={Activity} text="Routing can balance latency, quality, and budget without exposing test spend." />
          </div>
          <div style={{
            minWidth: 0,
            wordBreak: 'break-word',
            overflow: 'hidden'
          }}>
            <StatusCard label="Reporting" value="Waiting for usage" icon={CircleDollarSign} text="Spend summaries will populate from live review activity." />
          </div>
        </div>
        
        {/* Routing Policy Section */}
        <section style={{
          width: '100%',
          overflow: 'hidden'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px',
            marginBottom: '16px'
          }}>
            <h2 style={{
              fontSize: 'clamp(16px, 2vw, 22px)',
              fontWeight: 600,
              margin: 0,
              color: 'white'
            }}>Routing policy</h2>
            <Link to="/cost" style={{
              fontSize: '13px',
              whiteSpace: 'nowrap',
              color: '#ff4d8f',
              textDecoration: 'none'
            }}>Review settings</Link>
          </div>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {routingItems.map((item) => (
              <article 
                key={item.label}
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  wordBreak: 'break-word',
                  overflow: 'hidden',
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.055), rgba(255,255,255,0.025))',
                  border: '1px solid rgba(255,255,255,0.09)',
                  borderRadius: '16px'
                }}
              >
                <span style={{
                  color: '#ff4d8f',
                  fontFamily: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  display: 'block',
                  marginBottom: '8px'
                }}>{item.label}</span>
                <p style={{
                  fontSize: 'clamp(12px, 1.5vw, 14px)',
                  lineHeight: '1.55',
                  maxWidth: '100%',
                  margin: 0,
                  color: 'rgba(255,255,255,0.66)'
                }}>{item.text}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  )
}

function SettingsPage() {
  return (
    <AppShell>
      <PageHeader eyebrow="Settings" title="Connect GitHub and configure the memory bank." />
      <div className="settings-grid">
        <SettingCard icon={Code2} title="GitHub connection" text="OAuth connected. Webhook installation is ready for repository selection." />
        <SettingCard icon={KeyRound} title="Webhook secret" text="Payloads are verified with HMAC SHA-256 before processing." />
        <SettingCard icon={Database} title="Hindsight bank" text="Patterns are retained in the codebase-agent memory bank." />
        <SettingCard icon={Bell} title="Notifications" text="Slack notifications are planned for the Pro tier." />
      </div>
    </AppShell>
  )
}

function SettingCard({ icon: Icon, title, text }) {
  return (
    <article className="panel setting-card">
      <Icon size={20} />
      <h2>{title}</h2>
      <p>{text}</p>
    </article>
  )
}

function PricingPage() {
  return (
    <main>
      <PublicNav />
      <section className="section first">
        <div className="section-head">
          <p className="eyebrow">Pricing</p>
          <h1>Plans for teams that review code together.</h1>
        </div>
        <PricingCards />
      </section>
      <Footer />
    </main>
  )
}

function LegalPage({ type }) {
  const titles = {
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
    cookies: 'Cookie Policy',
    support: 'Support',
  }
  return (
    <main>
      <PublicNav />
      <section className="legal-page">
        <p className="eyebrow">{type}</p>
        <h1>{titles[type]}</h1>
        {type === 'support' ? (
          <p>For support, email support@codebasememory.agent. Include your workspace and repository so the team can help quickly.</p>
        ) : (
          <>
            <p>
              CMA processes pull request diffs to produce memory-grounded code reviews. Raw uploaded files are deleted immediately after parsing.
            </p>
            <p>
              The system stores extracted patterns, metadata, decisions, and review outcomes. It does not permanently store raw source code.
            </p>
            <p>
              This starter policy should be reviewed by counsel before production launch.
            </p>
          </>
        )}
      </section>
      <Footer />
    </main>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/signin" element={<AuthPage mode="signin" />} />
      <Route path="/signup" element={<AuthPage mode="signup" />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/dashboard" element={<Protected><DashboardHome /></Protected>} />
      <Route path="/reviews/new" element={<Protected><NewReviewPage /></Protected>} />
      <Route path="/reviews" element={<Protected><ReviewsPage /></Protected>} />
      <Route path="/reviews/:id" element={<Protected><ReviewDetailPage /></Protected>} />
      <Route path="/memory" element={<Protected><MemoryPage /></Protected>} />
      <Route path="/cost" element={<Protected><CostPage /></Protected>} />
      <Route path="/settings" element={<Protected><SettingsPage /></Protected>} />
      <Route path="/privacy" element={<LegalPage type="privacy" />} />
      <Route path="/terms" element={<LegalPage type="terms" />} />
      <Route path="/cookies" element={<LegalPage type="cookies" />} />
      <Route path="/support" element={<LegalPage type="support" />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App

