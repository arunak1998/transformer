import { useState } from 'react'
import { softmaxRow } from '../lib/linalg'

const WORDS = ['The', 'cat', 'sat', 'down']
const COLORS = ['#ff7ab8', '#5ee0ff', '#b6ff7a', '#ffc46b']

// Drag the match scores and watch the shares of attention react.
export default function SoftmaxPlayground() {
  const [scores, setScores] = useState([1, 4, 2, 0])
  const shares = softmaxRow(scores)

  const setScore = (i, v) => setScores((s) => s.map((x, k) => (k === i ? v : x)))

  return (
    <div className="panel">
      <h4>Play with softmax</h4>
      <p className="muted">
        Softmax turns any scores into shares that add up to 100%. Drag a score and watch: the winner takes more, the others shrink.
      </p>
      <div className="sm-grid">
        <div>
          <div className="mini-title">match scores (you control)</div>
          {WORDS.map((w, i) => (
            <label key={w} className="sm-slider">
              <span style={{ color: COLORS[i] }}>{w}</span>
              <input type="range" min={-3} max={8} step={0.5} value={scores[i]} onChange={(e) => setScore(i, +e.target.value)} style={{ accentColor: COLORS[i] }} />
              <b className="mono">{scores[i].toFixed(1)}</b>
            </label>
          ))}
          <button className="btn ghost small-btn" style={{ marginLeft: 0 }} onClick={() => setScores([1, 4, 2, 0])}>↺ reset</button>
        </div>
        <div>
          <div className="mini-title">share of attention</div>
          <div className="sm-bars">
            {shares.map((p, i) => (
              <div key={i} className="sm-col">
                <b className="mono">{Math.round(p * 100)}%</b>
                <div className="sm-bar" style={{ height: 4 + p * 130, background: COLORS[i] }} />
                <span>{WORDS[i]}</span>
              </div>
            ))}
          </div>
          <div className="sm-total">Total: <b>{Math.round(shares.reduce((a, b) => a + b, 0) * 100)}%</b> — always</div>
        </div>
      </div>
    </div>
  )
}
