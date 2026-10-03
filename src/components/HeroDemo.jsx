import { useEffect, useState } from 'react'

// A looping mini-Transformer: type → tokenize → attend → predict → write.
const SENTENCE = 'The cat licked its'
const TOKENS = [
  { text: 'The', x: 70, color: '#ffc46b' },
  { text: 'cat', x: 170, color: '#ff7ab8' },
  { text: 'licked', x: 280, color: '#5ee0ff' },
  { text: 'its', x: 390, color: '#b6ff7a' },
]
const ATTENTION = [0.08, 0.74, 0.14] // how much "its" looks at The / cat / licked
const NEXT = [['paw', 0.72], ['tail', 0.12], ['fur', 0.09], ['face', 0.07]]

// Timeline in ticks of 110 ms.
const T = { tokens: 22, attend: 34, predict: 50, write: 66, end: 100 }

const stageOf = (t) => (t >= T.write ? 3 : t >= T.predict ? 2 : t >= T.attend ? 1 : t >= T.tokens ? 0 : -1)
const STAGES = ['Tokenize', 'Attend', 'Predict', 'Write']

export default function HeroDemo() {
  const [t, setT] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setT((v) => (v + 1) % T.end), 110)
    return () => clearInterval(id)
  }, [])

  const stage = stageOf(t)
  const typed = SENTENCE.slice(0, Math.min(t, SENTENCE.length))
  const its = TOKENS[3]

  return (
    <div className="hd">
      <div className="hd-top">
        <span className="hd-dot" /><span className="hd-dot" /><span className="hd-dot" />
        <span className="hd-title">transformer.live</span>
      </div>

      <div className="hd-stages">
        {STAGES.map((s, i) => (
          <span key={s} className={`hd-stage ${i === stage ? 'on' : ''} ${i < stage ? 'done' : ''}`}>{i + 1} {s}</span>
        ))}
      </div>

      <div className="hd-input">
        <span className="hd-prompt">›</span>
        {typed}
        {stage === 3 && <span className="hd-new"> paw</span>}
        <span className="hd-caret">▍</span>
      </div>

      <svg viewBox="0 50 460 150" className="hd-svg">
        {stage >= 1 &&
          TOKENS.slice(0, 3).map((tok, i) => {
            const mid = (tok.x + its.x) / 2
            const lift = 20 + (its.x - tok.x) * 0.18
            return (
              <g key={tok.text}>
                <path d={`M ${its.x} 146 Q ${mid} ${146 - lift * 2} ${tok.x} 146`} fill="none" stroke="#ff7ab8"
                  strokeWidth={1 + ATTENTION[i] * 9} strokeLinecap="round" opacity={0.25 + ATTENTION[i] * 0.75} className="hd-arc" />
                <text x={mid} y={146 - lift - 8} textAnchor="middle" className="hd-pct">{Math.round(ATTENTION[i] * 100)}%</text>
              </g>
            )
          })}
        {stage >= 0 &&
          TOKENS.map((tok, i) => (
            <g key={tok.text} className="hd-tok" style={{ animationDelay: `${i * 0.12}s` }}>
              <rect x={tok.x - 42} y="148" width="84" height="38" rx="10" fill={`${tok.color}22`} stroke={tok.color}
                strokeWidth={stage >= 1 && i === 3 ? 2.5 : 1.2} />
              <text x={tok.x} y="172" textAnchor="middle" fill={tok.color} className="hd-tok-text">{tok.text}</text>
            </g>
          ))}
        {stage === -1 && <text x="230" y="172" textAnchor="middle" className="hd-wait">waiting for text…</text>}
      </svg>

      <div className={`hd-bars ${stage >= 2 ? 'show' : ''}`}>
        <div className="hd-bars-title">next word?</div>
        {NEXT.map(([w, p], i) => (
          <div key={w} className={`hd-bar ${i === 0 ? 'win' : ''}`}>
            <span>{w}</span>
            <div className="hd-track"><div style={{ width: stage >= 2 ? `${p * 100}%` : 0 }} /></div>
            <b>{Math.round(p * 100)}%</b>
          </div>
        ))}
      </div>
    </div>
  )
}
