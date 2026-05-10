import { useState, useEffect } from 'react'
import axios from 'axios'

const LOADING_STEPS = [
  { label: 'Reading audience conversations...', duration: 8000 },
  { label: 'Filtering repetitive comments...', duration: 8000 },
  { label: 'Mapping semantic similarity...', duration: 10000 },
  { label: 'Discovering recurring themes...', duration: 8000 },
]

const CLUSTER_COLORS = [
  { border: '#E8645A', num: '#E8645A', bg: '#FFF5F4', badge: '#FFE8E6', badgeText: '#C0392B' },
  { border: '#F0A500', num: '#F0A500', bg: '#FFFBF0', badge: '#FFF3CD', badgeText: '#8B6200' },
  { border: '#7B68EE', num: '#7B68EE', bg: '#F8F7FF', badge: '#EDEDFF', badgeText: '#3D35A0' },
  { border: '#3DAA7D', num: '#3DAA7D', bg: '#F4FBF8', badge: '#E0F5EC', badgeText: '#1A6B4A' },
  { border: '#E87D5A', num: '#E87D5A', bg: '#FFF7F4', badge: '#FFE8DC', badgeText: '#A03A1A' },
]

function getEngagement(avgLikes) {
  if (avgLikes >= 5) return { label: 'High', color: '#3DAA7D', arrow: '↑' }
  if (avgLikes >= 2) return { label: 'Medium', color: '#F0A500', arrow: '→' }
  return { label: 'Low', color: '#999', arrow: '↓' }
}

export default function App() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)
  const [expandedClusters, setExpandedClusters] = useState({})

  const analyze = async () => {
    if (!url.trim()) return
    setError(null)
    setResults(null)
    setLoading(true)
    setLoadingStep(0)
    setLoadingProgress(0)

    // progress animation
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
      const response = await axios.post('http://127.0.0.1:8000/api/analyze/', { url })
      setLoadingProgress(100)
      setTimeout(() => {
        setResults(response.data)
        setLoading(false)
      }, 400)
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Try again.')
      setLoading(false)
    } finally {
      clearInterval(progressInterval)
      clearInterval(stepInterval)
    }
  }

  const toggleCluster = (id) => {
    setExpandedClusters(prev => ({ ...prev, [id]: !prev[id] }))
  }

  // ── Screen 1: Input ──────────────────────────────────────────────
  if (!loading && !results) {
    return (
      <div style={s.page}>
        <style>{globalStyles}</style>
        <div style={s.inputPage}>
          <div style={s.brand}>
            <div style={s.logoMark}>
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <circle cx="14" cy="14" r="13" stroke="#2D2D2D" strokeWidth="1.5"/>
                <circle cx="14" cy="14" r="6" stroke="#2D2D2D" strokeWidth="1.5"/>
                <circle cx="14" cy="14" r="2" fill="#2D2D2D"/>
                <line x1="14" y1="1" x2="14" y2="6" stroke="#2D2D2D" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="14" y1="22" x2="14" y2="27" stroke="#2D2D2D" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="1" y1="14" x2="6" y2="14" stroke="#2D2D2D" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="22" y1="14" x2="27" y2="14" stroke="#2D2D2D" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span style={s.brandName}>CommentLens</span>
          </div>

          <div style={s.heroSection}>
            <p style={s.eyebrow}>Audience Intelligence</p>
            <h1 style={s.heroTitle}>
              What is your audience<br />
              <em style={s.heroEm}>really</em> saying?
            </h1>
            <p style={s.heroSub}>
              Paste any YouTube URL. We'll read every comment so you don't have to —
              and surface exactly what your audience wants next.
            </p>

            <div style={s.inputCard}>
              <div style={s.inputWrapper}>
                <svg style={s.ytIcon} viewBox="0 0 24 24" fill="#FF0000">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                <input
                  style={s.input}
                  type="text"
                  placeholder="Paste a YouTube video URL..."
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && analyze()}
                  className="comment-input"
                />
                <button style={s.analyzeBtn} onClick={analyze} className="analyze-btn">
                  Analyse
                </button>
              </div>
              {error && <p style={s.errorMsg}>{error}</p>}
              <p style={s.inputNote}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{marginRight:4}}>
                  <path d="M6 1a5 5 0 100 10A5 5 0 006 1zm0 2a.75.75 0 110 1.5A.75.75 0 016 3zm0 2.5a.5.5 0 01.5.5v3a.5.5 0 01-1 0V6a.5.5 0 01.5-.5z" fill="#999"/>
                </svg>
                Your data is private and never stored
              </p>
            </div>

            <div style={s.statsRow}>
              <div style={s.stat}>
                <span style={s.statNum}>100+</span>
                <span style={s.statLabel}>Comments analysed</span>
              </div>
              <div style={s.statDivider}/>
              <div style={s.stat}>
                <span style={s.statNum}>4–8</span>
                <span style={s.statLabel}>Topic clusters</span>
              </div>
              <div style={s.statDivider}/>
              <div style={s.stat}>
                <span style={s.statNum}>~40s</span>
                <span style={s.statLabel}>Average analysis time</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Screen 2: Loading ────────────────────────────────────────────
  if (loading) {
    return (
      <div style={s.page}>
        <style>{globalStyles}</style>
        <div style={s.loadingPage}>
          <div style={s.brand}>
            <div style={s.logoMark}>
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <circle cx="14" cy="14" r="13" stroke="#2D2D2D" strokeWidth="1.5"/>
                <circle cx="14" cy="14" r="6" stroke="#2D2D2D" strokeWidth="1.5"/>
                <circle cx="14" cy="14" r="2" fill="#2D2D2D"/>
                <line x1="14" y1="1" x2="14" y2="6" stroke="#2D2D2D" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="14" y1="22" x2="14" y2="27" stroke="#2D2D2D" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="1" y1="14" x2="6" y2="14" stroke="#2D2D2D" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="22" y1="14" x2="27" y2="14" stroke="#2D2D2D" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span style={s.brandName}>CommentLens</span>
          </div>

          <div style={s.loadingContent}>
            <h2 style={s.loadingTitle}>Analysing audience conversations...</h2>

            <div style={s.stepsList}>
              {LOADING_STEPS.map((step, i) => (
                <div key={i} style={s.stepRow}>
                  <div style={{
                    ...s.stepDot,
                    background: i < loadingStep ? '#3DAA7D' : i === loadingStep ? '#E8645A' : '#E8E8E8',
                    border: i === loadingStep ? '2px solid #E8645A' : '2px solid transparent',
                  }}>
                    {i < loadingStep && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    )}
                    {i === loadingStep && (
                      <div style={s.spinnerDot} className="pulse"/>
                    )}
                  </div>
                  <span style={{
                    ...s.stepLabel,
                    color: i <= loadingStep ? '#2D2D2D' : '#BBBBBB',
                    fontWeight: i === loadingStep ? '500' : '400',
                  }}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>

            <div style={s.progressSection}>
              <div style={s.progressBar}>
                <div style={{ ...s.progressFill, width: `${loadingProgress}%` }} className="progress-fill"/>
              </div>
              <span style={s.progressText}>{loadingProgress}%</span>
            </div>

            <p style={s.loadingNote}>This usually takes 30–60 seconds</p>
          </div>
        </div>
      </div>
    )
  }

  // ── Screen 3: Results ────────────────────────────────────────────
  const totalClustered = results.clusters.reduce((sum, c) => sum + c.size, 0)

  return (
    <div style={s.page}>
      <style>{globalStyles}</style>

      {/* Header */}
      <div style={s.resultsHeader}>
        <div style={s.brand}>
          <div style={s.logoMark}>
            <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="13" stroke="#2D2D2D" strokeWidth="1.5"/>
              <circle cx="14" cy="14" r="6" stroke="#2D2D2D" strokeWidth="1.5"/>
              <circle cx="14" cy="14" r="2" fill="#2D2D2D"/>
              <line x1="14" y1="1" x2="14" y2="6" stroke="#2D2D2D" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="14" y1="22" x2="14" y2="27" stroke="#2D2D2D" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="1" y1="14" x2="6" y2="14" stroke="#2D2D2D" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="22" y1="14" x2="27" y2="14" stroke="#2D2D2D" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span style={s.brandName}>CommentLens</span>
        </div>
        <button style={s.newAnalysisBtn} onClick={() => { setResults(null); setUrl('') }} className="new-analysis-btn">
          + New analysis
        </button>
      </div>

      <div style={s.resultsBody}>
        {/* Video info */}
        <div style={s.videoInfo}>
          <p style={s.eyebrow}>Analysis complete</p>
          <h2 style={s.videoTitle}>{results.video_title}</h2>
        </div>

        {/* Stats row */}
        <div style={s.metricsRow}>
          <div style={s.metricCard}>
            <div style={s.metricIcon}>💬</div>
            <div>
              <p style={s.metricNum}>{results.total_comments_fetched}</p>
              <p style={s.metricLabel}>Total Comments</p>
              <p style={s.metricSub}>100% analysed</p>
            </div>
          </div>
          <div style={s.metricCard}>
            <div style={s.metricIcon}>🔍</div>
            <div>
              <p style={s.metricNum}>{results.clusters.length}</p>
              <p style={s.metricLabel}>Topics Found</p>
              <p style={s.metricSub}>Top signals shown</p>
            </div>
          </div>
          <div style={s.metricCard}>
            <div style={s.metricIcon}>✨</div>
            <div>
              <p style={s.metricNum}>{results.total_after_cleaning}</p>
              <p style={s.metricLabel}>Signal Comments</p>
              <p style={s.metricSub}>After noise removal</p>
            </div>
          </div>
        </div>

        {/* Clusters */}
        <div style={s.clustersSection}>
          <div style={s.sectionHeader}>
            <span style={s.sparkle}>✦</span>
            <h3 style={s.sectionTitle}>Top Audience Signals</h3>
          </div>

          <div style={s.clustersList}>
            {results.clusters.map((cluster, idx) => {
              const color = CLUSTER_COLORS[idx % CLUSTER_COLORS.length]
              const engagement = getEngagement(cluster.avg_likes)
              const isExpanded = expandedClusters[cluster.cluster_id]

              return (
                <div key={cluster.cluster_id} style={{ ...s.clusterCard, borderLeft: `4px solid ${color.border}` }}>
                  <div style={s.clusterTop}>
                    <div style={{ ...s.clusterNum, color: color.num, background: color.bg }}>
                      {String(idx + 1).padStart(2, '0')}
                    </div>
                    <div style={s.clusterMain}>
                      <div style={s.clusterTitleRow}>
                        <h4 style={s.clusterTitle}>
                          {cluster.top_comments[0]?.slice(0, 60)}...
                        </h4>
                        <span style={{ ...s.percentBadge, background: color.badge, color: color.badgeText }}>
                          {cluster.percentage}% of comments
                        </span>
                      </div>
                      <p style={s.clusterSub}>
                        {cluster.size} comments in this topic cluster
                      </p>

                      <div style={s.repComments}>
                        <p style={s.repLabel}>Representative comments</p>
                        {cluster.top_comments.map((comment, i) => (
                          <div key={i} style={s.repComment}>
                            <span style={s.repQuote}>"</span>
                            <span style={s.repText}>{comment}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={s.clusterStats}>
                      <div style={s.engagementBox}>
                        <p style={s.engLabel}>Engagement</p>
                        <p style={{ ...s.engValue, color: engagement.color }}>
                          {engagement.label} {engagement.arrow}
                        </p>
                      </div>
                      <div style={s.engagementBox}>
                        <p style={s.engLabel}>Avg. Likes</p>
                        <p style={s.engNum}>{cluster.avg_likes}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <p style={s.footer}>
          CommentLens · Built with Python, Django, sentence-transformers & HDBSCAN
        </p>
      </div>
    </div>
  )
}

// ── Styles ──────────────────────────────────────────────────────────
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #FAF9F6; font-family: 'DM Sans', sans-serif; }

  .comment-input:focus { outline: none; border-color: #2D2D2D !important; }
  .analyze-btn:hover { background: #1a1a1a !important; transform: translateY(-1px); }
  .analyze-btn:active { transform: translateY(0); }
  .new-analysis-btn:hover { background: #F5F5F5 !important; }

  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.4; transform: scale(0.8); }
  }
  .pulse { animation: pulse 1s ease-in-out infinite; }

  @keyframes fillProgress {
    from { width: 0%; }
  }
  .progress-fill { transition: width 0.6s ease; }
`

const s = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#FAF9F6',
    fontFamily: "'DM Sans', sans-serif",
  },

  // brand
  brand: { display: 'flex', alignItems: 'center', gap: 10 },
  logoMark: {
    width: 36, height: 36,
    borderRadius: '50%',
    border: '1px solid #E8E8E8',
    background: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  brandName: { fontSize: 16, fontWeight: 600, color: '#2D2D2D', letterSpacing: '-0.3px' },

  // input page
  inputPage: {
    maxWidth: 680,
    margin: '0 auto',
    padding: '48px 24px',
  },
  heroSection: { marginTop: 64 },
  eyebrow: {
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: '#E8645A',
    marginBottom: 16,
  },
  heroTitle: {
    fontFamily: "'Lora', serif",
    fontSize: 'clamp(2rem, 5vw, 3rem)',
    fontWeight: 600,
    color: '#1A1A1A',
    lineHeight: 1.2,
    marginBottom: 20,
    letterSpacing: '-0.5px',
  },
  heroEm: {
    fontStyle: 'italic',
    color: '#E8645A',
  },
  heroSub: {
    fontSize: 16,
    color: '#666',
    lineHeight: 1.7,
    marginBottom: 40,
    maxWidth: 520,
  },
  inputCard: {
    background: '#fff',
    border: '1px solid #E8E8E8',
    borderRadius: 16,
    padding: 24,
    boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
    marginBottom: 40,
  },
  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    background: '#FAF9F6',
    border: '1.5px solid #E8E8E8',
    borderRadius: 10,
    padding: '4px 4px 4px 16px',
    marginBottom: 12,
  },
  ytIcon: { width: 20, height: 20, flexShrink: 0 },
  input: {
    flex: 1,
    border: 'none',
    background: 'transparent',
    fontSize: 14,
    color: '#2D2D2D',
    outline: 'none',
    fontFamily: "'DM Sans', sans-serif",
    padding: '10px 0',
  },
  analyzeBtn: {
    background: '#2D2D2D',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '12px 24px',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'all 0.15s ease',
    whiteSpace: 'nowrap',
  },
  inputNote: {
    fontSize: 12,
    color: '#999',
    display: 'flex',
    alignItems: 'center',
  },
  errorMsg: { color: '#E8645A', fontSize: 13, marginTop: 8 },

  statsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 32,
  },
  stat: { display: 'flex', flexDirection: 'column', gap: 2 },
  statNum: { fontSize: 24, fontWeight: 600, color: '#1A1A1A', fontFamily: "'Lora', serif" },
  statLabel: { fontSize: 12, color: '#999' },
  statDivider: { width: 1, height: 32, background: '#E8E8E8' },

  // loading page
  loadingPage: {
    maxWidth: 600,
    margin: '0 auto',
    padding: '48px 24px',
  },
  loadingContent: { marginTop: 80 },
  loadingTitle: {
    fontFamily: "'Lora', serif",
    fontSize: 28,
    fontWeight: 600,
    color: '#1A1A1A',
    marginBottom: 40,
    letterSpacing: '-0.3px',
  },
  stepsList: { display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 40 },
  stepRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: '14px 0',
    borderBottom: '1px solid #F0F0F0',
  },
  stepDot: {
    width: 28, height: 28,
    borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
    transition: 'all 0.3s ease',
  },
  spinnerDot: {
    width: 8, height: 8,
    borderRadius: '50%',
    background: '#fff',
  },
  stepLabel: { fontSize: 15, transition: 'color 0.3s ease' },
  progressSection: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  progressBar: {
    flex: 1,
    height: 6,
    background: '#F0F0F0',
    borderRadius: 99,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #E8645A, #F0A500)',
    borderRadius: 99,
  },
  progressText: { fontSize: 13, fontWeight: 500, color: '#2D2D2D', minWidth: 36 },
  loadingNote: { fontSize: 13, color: '#999' },

  // results page
  resultsHeader: {
    background: '#fff',
    borderBottom: '1px solid #EFEFEF',
    padding: '16px 32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  newAnalysisBtn: {
    background: '#fff',
    border: '1px solid #E8E8E8',
    borderRadius: 8,
    padding: '8px 16px',
    fontSize: 13,
    fontWeight: 500,
    color: '#2D2D2D',
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'background 0.15s',
  },
  resultsBody: {
    maxWidth: 860,
    margin: '0 auto',
    padding: '40px 24px 80px',
  },
  videoInfo: { marginBottom: 32 },
  videoTitle: {
    fontFamily: "'Lora', serif",
    fontSize: 'clamp(1.3rem, 3vw, 1.8rem)',
    fontWeight: 600,
    color: '#1A1A1A',
    letterSpacing: '-0.3px',
    marginTop: 8,
    lineHeight: 1.3,
  },

  // metrics
  metricsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 16,
    marginBottom: 48,
  },
  metricCard: {
    background: '#fff',
    border: '1px solid #EFEFEF',
    borderRadius: 16,
    padding: '20px 24px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: 16,
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  metricIcon: { fontSize: 28 },
  metricNum: {
    fontFamily: "'Lora', serif",
    fontSize: 28,
    fontWeight: 600,
    color: '#1A1A1A',
    lineHeight: 1,
    marginBottom: 4,
  },
  metricLabel: { fontSize: 13, fontWeight: 500, color: '#2D2D2D', marginBottom: 2 },
  metricSub: { fontSize: 11, color: '#999' },

  // clusters
  clustersSection: { marginBottom: 48 },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 24,
  },
  sparkle: { color: '#E8645A', fontSize: 16 },
  sectionTitle: {
    fontFamily: "'Lora', serif",
    fontSize: 20,
    fontWeight: 600,
    color: '#1A1A1A',
  },
  clustersList: { display: 'flex', flexDirection: 'column', gap: 16 },
  clusterCard: {
    background: '#fff',
    borderRadius: '0 16px 16px 0',
    padding: 24,
    border: '1px solid #EFEFEF',
    borderLeft: '4px solid #E8645A',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  clusterTop: { display: 'flex', gap: 20, alignItems: 'flex-start' },
  clusterNum: {
    width: 44, height: 44,
    borderRadius: 10,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 14, fontWeight: 700,
    flexShrink: 0,
    fontFamily: "'Lora', serif",
  },
  clusterMain: { flex: 1 },
  clusterTitleRow: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  clusterTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: '#1A1A1A',
    lineHeight: 1.4,
    fontFamily: "'DM Sans', sans-serif",
  },
  percentBadge: {
    fontSize: 12,
    fontWeight: 500,
    padding: '3px 10px',
    borderRadius: 99,
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  clusterSub: { fontSize: 13, color: '#999', marginBottom: 16 },
  repComments: { display: 'flex', flexDirection: 'column', gap: 8 },
  repLabel: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#999',
    marginBottom: 4,
  },
  repComment: { display: 'flex', gap: 6, alignItems: 'flex-start' },
  repQuote: { color: '#CCCCCC', fontSize: 16, lineHeight: 1, flexShrink: 0, marginTop: 1 },
  repText: { fontSize: 13, color: '#555', lineHeight: 1.6 },
  clusterStats: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    flexShrink: 0,
    minWidth: 90,
  },
  engagementBox: {
    background: '#FAF9F6',
    borderRadius: 10,
    padding: '10px 14px',
    textAlign: 'center',
  },
  engLabel: { fontSize: 10, color: '#999', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 },
  engValue: { fontSize: 14, fontWeight: 600 },
  engNum: { fontSize: 20, fontWeight: 600, color: '#1A1A1A', fontFamily: "'Lora', serif" },

  footer: {
    textAlign: 'center',
    fontSize: 12,
    color: '#CCC',
    paddingTop: 24,
    borderTop: '1px solid #F0F0F0',
  },
}