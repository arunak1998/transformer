import { useState } from 'react'
import Section from '../components/Section'
import Callout from '../components/Callout'
import { dot } from '../lib/linalg'
import { VOCAB } from '../lib/vocab'

// Illustration: we NAME the columns so the idea is visible. Real models learn unnamed columns.
const FEATURES = ['Animal', 'Royal', 'Food', 'Vehicle', 'Big']
const TABLE = [
  { word: 'cat', id: VOCAB.indexOf('cat'), vec: [1, 0, 0, 0, 0.1] },
  { word: 'dog', id: VOCAB.indexOf('dog'), vec: [1, 0, 0, 0, 0.3] },
  { word: 'lion', id: VOCAB.indexOf('lion'), vec: [1, 0, 0, 0, 0.8] },
  { word: 'king', id: VOCAB.indexOf('king'), vec: [0.1, 1, 0, 0, 0.6] },
  { word: 'queen', id: VOCAB.indexOf('queen'), vec: [0.1, 1, 0, 0, 0.5] },
  { word: 'apple', id: VOCAB.indexOf('apple'), vec: [0, 0, 1, 0, 0.05] },
  { word: 'car', id: VOCAB.indexOf('car'), vec: [0, 0, 0, 1, 0.7] },
]
const idOf = (word) => VOCAB.indexOf(word)
const COLORS = ['#ff7ab8', '#5ee0ff', '#b6ff7a', '#a78bfa', '#ffc46b']

const similarity = (a, b) => dot(a, b) / (Math.hypot(...a) * Math.hypot(...b))

function FeatureBars({ values, color }) {
  return (
    <div className="fb">
      {FEATURES.map((f, i) => (
        <div key={f} className="fb-row">
          <span className="fb-label">{f}</span>
          <div className="fb-track"><div style={{ width: `${values[i] * 100}%`, background: color }} /></div>
          <span className="fb-num mono">{values[i].toFixed(2)}</span>
        </div>
      ))}
    </div>
  )
}

function IdProblem() {
  return (
    <div className="panel">
      <h4>Why not just use the ID number?</h4>
      <p className="muted">
        Because an ID is only a label, like a locker number. Locker 41 is not “almost” locker 42, and the numbers say nothing about meaning.
      </p>
      <div className="id-row">
        {TABLE.map((t) => (
          <div key={t.word} className="id-chip"><span>{t.word}</span><b className="mono">{t.id}</b></div>
        ))}
      </div>
      <p className="muted small">Here “cat” = {idOf('cat')} and “dog” = {idOf('dog')} are neighbours by luck, but “lion” = {idOf('lion')} looks far away even though it is also an animal.</p>
    </div>
  )
}

function Lookup() {
  const [sel, setSel] = useState(0)
  const row = TABLE[sel]
  return (
    <div className="panel main-panel">
      <h4>The fix: each word gets a row of numbers</h4>
      <p className="muted">
        A big table stores one row per token. Each column measures something. (Here we named the columns so you can read them. In real models
        the columns are learned and have no names.) Click a word:
      </p>
      <div className="emb-layout">
        <div className="emb-table-wrap">
          <table className="emb-table">
            <thead>
              <tr><th>ID</th><th>word</th>{FEATURES.map((f) => <th key={f}>{f}</th>)}</tr>
            </thead>
            <tbody>
              {TABLE.map((t, i) => (
                <tr key={t.word} className={i === sel ? 'on' : ''} onClick={() => setSel(i)}>
                  <td className="mono muted">{t.id}</td>
                  <td><b>{t.word}</b></td>
                  {t.vec.map((v, k) => <td key={k} className="mono" style={{ opacity: 0.35 + 0.65 * v }}>{v.toFixed(2)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="emb-arrow">→</div>
        <div className="emb-picked">
          <div className="mini-title">the model gets this for “{row.word}”</div>
          <FeatureBars values={row.vec} color="var(--violet)" />
        </div>
      </div>
    </div>
  )
}

function Neighbours() {
  const [sel, setSel] = useState(0)
  const me = TABLE[sel]
  const ranked = TABLE.filter((_, i) => i !== sel)
    .map((t) => ({ ...t, sim: similarity(me.vec, t.vec) }))
    .sort((a, b) => b.sim - a.sim)

  return (
    <div className="panel">
      <h4>Now meaning becomes measurable</h4>
      <p className="muted">Words with similar rows are similar in meaning. Pick a word and see who is closest.</p>
      <div className="focus-row">
        {TABLE.map((t, i) => (
          <button key={t.word} className={`pill ${i === sel ? 'active' : ''}`} onClick={() => setSel(i)}>{t.word}</button>
        ))}
      </div>
      <div className="nb-list">
        {ranked.map((t, i) => (
          <div key={t.word} className="nb-row">
            <span className="nb-word">{t.word}</span>
            <div className="nb-track"><div style={{ width: `${Math.max(0, t.sim) * 100}%`, background: COLORS[i % COLORS.length] }} /></div>
            <b className="mono">{Math.round(t.sim * 100)}%</b>
          </div>
        ))}
      </div>
      <p className="muted small">
        “Similarity” compares the direction of two rows of numbers. 100% = the same direction. Attention later uses this same idea of matching to
        decide which words belong together.
      </p>
    </div>
  )
}

export default function Embeddings() {
  return (
    <Section
      id="embeddings"
      num="02"
      kicker="Step 2 · IDs → vectors"
      title="Embeddings"
      lead="An ID number has no meaning. So the next step swaps each ID for a row of numbers that describes the word. This row is called an embedding (or vector)."
    >
      <IdProblem />
      <Lookup />
      <Neighbours />

      <Callout type="note" title="In a real model">
        There are hundreds or thousands of columns (GPT-3 uses 12,288), and nobody chooses what they measure. The whole table starts random and is
        <b> learned during training</b>, so words used in similar ways end up with similar rows.
      </Callout>
    </Section>
  )
}
