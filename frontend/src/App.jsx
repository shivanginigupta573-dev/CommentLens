import { useState } from 'react'
import axios from 'axios'
import './App.css'
const API_URL = import.meta.env.VITE_API_URL;

const LOADING_STEPS = [
  'Reading audience conversations...',
  'Filtering repetitive comments...',
  'Mapping semantic similarity...',
  'Discovering recurring themes...',
]

const CLUSTER_COLORS = [
  { border: '#E8645A', numColor: '#E8645A', numBg: '#FFF5F4', badge: '#FFE8E6', badgeText: '#C0392B' },
  { border: '#F0A500', numColor: '#F0A500', numBg: '#FFFBF0', badge: '#FFF3CD', badgeText: '#8B6200' },
  { border: '#7B68EE', numColor: '#7B68EE', numBg: '#F8F7FF', badge: '#EDEDFF', badgeText: '#3D35A0' },
  { border: '#3DAA7D', numColor: '#3DAA7D', numBg: '#F4FBF8', badge: '#E0F5EC', badgeText: '#1A6B4A' },
  { border: '#E87D5A', numColor: '#E87D5A', numBg: '#FFF7F4', badge: '#FFE8DC', badgeText: '#A03A1A' },
]

function getEngagement(avgLikes) {
  if (avgLikes >= 5) return { label: 'High', color: '#3DAA7D', arrow: '↑' }
  if (avgLikes >= 2) return { label: 'Medium', color: '#F0A500', arrow: '→' }
  return { label: 'Low', color: '#999', arrow: '↓' }
}

function Logo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="13" stroke="#2D2D2D" strokeWidth="1.5"/>
      <circle cx="14" cy="14" r="6" stroke="#2D2D2D" strokeWidth="1.5"/>
      <circle cx="14" cy="14" r="2" fill="#2D2D2D"/>
      <line x1="14" y1="1" x2="14" y2="6" stroke="#2D2D2D" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="14" y1="22" x2="14" y2="27" stroke="#2D2D2D" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="1" y1="14" x2="6" y2="14" stroke="#2D2D2D" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="22" y1="14" x2="27" y2="14" stroke="#2D2D2D" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function Brand() {
  return (
    <div className="brand">
      <div className="logo-mark"><Logo size={22}/></div>
      <span className="brand-name">CommentLens</span>
    </div>
  )
}

export default function App() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)

  const analyze = async () => {
    if (!url.trim()) return
    setError(null)
    setResults(null)
    setLoading(true)
    setLoadingStep(0)
    setLoadingProgress(0)

    let step = 0
    let progress = 0

    const progressInterval = setInterval(() => {
      progress += 1.2
      if (progress > 95) progress = 95
      setLoadingProgress(Math.round(progress))
    }, 600)

    const stepInterval = setInterval(() => {
      step = Math.min(step + 1, LOADING_STEPS.length - 1)
      setLoadingStep(step)
    }, 9000)

    try {
      const response = await axios.post(`${API_URL}/api/analyze/`, { url });
      setLoadingProgress(100)
      setTimeout(() => {
        setResults(response.data)
        setLoading(false)
      }, 400)
    } catch (err) {
     setError(err.response?.data?.error || 'Backend requires local setup. See README for instructions.')
      setLoading(false)
    } finally {
      clearInterval(progressInterval)
      clearInterval(stepInterval)
    }
  }

  // ── Screen 1: Input ──────────────────────────────────────
  if (!loading && !results) {
    return (
      <div className="page">
        <div className="input-page">
          <Brand />
          <div className="hero-section">
            <p className="eyebrow">Audience Intelligence</p>
            <h1 className="hero-title">
              What is your audience<br />
              <em className="hero-em">really</em> saying?
            </h1>
            <p className="hero-sub">
              Paste any YouTube URL. We'll read every comment so you don't have to —
              and surface exactly what your audience wants next.
            </p>

            <div className="input-card">
              <div className="input-wrapper">
                <svg className="yt-icon" viewBox="0 0 24 24" fill="#FF0000">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                <input
                  className="url-input"
                  type="text"
                  placeholder="Paste a YouTube video URL..."
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && analyze()}
                />
                <button className="analyze-btn" onClick={analyze}>
                  Analyse
                </button>
              </div>
              {error && <p className="error-msg">{error}</p>}
              <p className="input-note">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M6 1a5 5 0 100 10A5 5 0 006 1zm0 2a.75.75 0 110 1.5A.75.75 0 016 3zm0 2.5a.5.5 0 01.5.5v3a.5.5 0 01-1 0V6a.5.5 0 01.5-.5z" fill="#999"/>
                </svg>
                Your data is private and never stored
              </p>
            </div>

            <div className="stats-row">
              <div className="stat">
                <span className="stat-num">100+</span>
                <span className="stat-label">Comments analysed</span>
              </div>
              <div className="stat-divider"/>
              <div className="stat">
                <span className="stat-num">4–8</span>
                <span className="stat-label">Topic clusters</span>
              </div>
              <div className="stat-divider"/>
              <div className="stat">
                <span className="stat-num">~40s</span>
                <span className="stat-label">Average analysis time</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Screen 2: Loading ─────────────────────────────────────
  if (loading) {
    return (
      <div className="page">
        <div className="loading-page">
          <Brand />
          <div className="loading-content">
            <h2 className="loading-title">Analysing audience conversations...</h2>

            <div className="steps-list">
              {LOADING_STEPS.map((step, i) => (
                <div key={i} className="step-row">
                  <div
                    className="step-dot"
                    style={{
                      background: i < loadingStep ? '#3DAA7D' : i === loadingStep ? '#E8645A' : '#E8E8E8',
                      border: i === loadingStep ? '2px solid #E8645A' : '2px solid transparent',
                    }}
                  >
                    {i < loadingStep && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    )}
                    {i === loadingStep && (
                      <div className="spinner-dot pulse"/>
                    )}
                  </div>
                  <span
                    className="step-label"
                    style={{
                      color: i <= loadingStep ? '#2D2D2D' : '#BBBBBB',
                      fontWeight: i === loadingStep ? 500 : 400,
                    }}
                  >
                    {step}
                  </span>
                </div>
              ))}
            </div>

            <div className="progress-section">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${loadingProgress}%` }}/>
              </div>
              <span className="progress-text">{loadingProgress}%</span>
            </div>

            <p className="loading-note">This usually takes 30–60 seconds</p>
          </div>
        </div>
      </div>
    )
  }

  // ── Screen 3: Results ─────────────────────────────────────
  return (
    <div className="page">
      <div className="results-header">
        <Brand />
        <button
          className="new-analysis-btn"
          onClick={() => { setResults(null); setUrl('') }}
        >
          + New analysis
        </button>
      </div>

      <div className="results-body">
        <div className="video-info">
          <p className="eyebrow">Analysis complete</p>
          <h2 className="video-title">{results.video_title}</h2>
        </div>

        <div className="metrics-row">
          <div className="metric-card">
            <div className="metric-icon">💬</div>
            <div>
              <p className="metric-num">{results.total_comments_fetched}</p>
              <p className="metric-label">Total Comments</p>
              <p className="metric-sub">100% analysed</p>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon">🔍</div>
            <div>
              <p className="metric-num">{results.clusters.length}</p>
              <p className="metric-label">Topics Found</p>
              <p className="metric-sub">Top signals shown</p>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon">✨</div>
            <div>
              <p className="metric-num">{results.total_after_cleaning}</p>
              <p className="metric-label">Signal Comments</p>
              <p className="metric-sub">After noise removal</p>
            </div>
          </div>
        </div>

        <div className="clusters-section">
          <div className="section-header">
            <span className="sparkle">✦</span>
            <h3 className="section-title">Top Audience Signals</h3>
          </div>

          <div className="clusters-list">
            {results.clusters.slice(0, 5).map((cluster, idx) => {
              const color = CLUSTER_COLORS[idx % CLUSTER_COLORS.length]
              const engagement = getEngagement(cluster.avg_likes)

              return (
                <div
                  key={cluster.cluster_id}
                  className="cluster-card"
                  style={{ borderLeftColor: color.border }}
                >
                  <div className="cluster-top">
                    <div
                      className="cluster-num"
                      style={{ color: color.numColor, background: color.numBg }}
                    >
                      {String(idx + 1).padStart(2, '0')}
                    </div>

                    <div className="cluster-main">
                      <div className="cluster-title-row">
                        <h4 className="cluster-title">
                          {cluster.top_comments && cluster.top_comments[0]
                            ? cluster.top_comments[0]
                                .split(' ').slice(0, 8).join(' ')
                                .replace(/[^a-zA-Z0-9\s]/g, '').trim() + '...'
                            : `Topic Signal #${idx + 1}`}
                        </h4>
                        <span
                          className="percent-badge"
                          style={{ background: color.badge, color: color.badgeText }}
                        >
                          {cluster.percentage}% of comments
                        </span>
                      </div>

                      <p className="cluster-sub">
                        {cluster.size} comments in this topic cluster
                      </p>

                      <div className="rep-comments">
                        <p className="rep-label">Representative comments</p>
                        {cluster.top_comments.map((comment, i) => (
                          <div key={i} className="rep-comment">
                            <span className="rep-quote">"</span>
                            <span className="rep-text">{comment}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="cluster-stats">
                      <div className="engagement-box">
                        <p className="eng-label">Engagement</p>
                        <p className="eng-value" style={{ color: engagement.color }}>
                          {engagement.label} {engagement.arrow}
                        </p>
                      </div>
                      <div className="engagement-box">
                        <p className="eng-label">Avg. Likes</p>
                        <p className="eng-num">{cluster.avg_likes}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <p className="footer">
          CommentLens · Built with love.
        </p>
      </div>
    </div>
  )
}