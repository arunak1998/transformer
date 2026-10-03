import { useState } from 'react'
import Section from '../components/Section'
import Callout from '../components/Callout'
import { softmaxRow } from '../lib/linalg'

// Toy "model": logits for the next word, given what has been written so far.
const NEXT_LOGITS = {
  '': { le: 4.0, la: 2.2, un: 1.5, chat: 0.3, '<eos>': -2 },
  le: { chat: 4.2, chien: 3.0, noir: 1.2, dort: 0.2, '<eos>': -3 },
  la: { chatte: 3.6, souris: 2.0, nuit: 1.1, '<eos>': -3 },
  'le chat': { dort: 4.0, est: 2.4, mange: 2.6, noir: 2.1, '<eos>': 0.2 },
  'le chien': { dort: 3.4, mange: 3.3, court: 2.6, '<eos>': 0.1 },
  'le chat dort': { '.': 3.4, '<eos>': 2.8, profondément: 2.3, encore: 1.2 },
}
const FALLBACK = { '.': 3.0, '<eos>': 3.2, et: 0.6 }

const logitsFor = (written) => NEXT_LOGITS[written.join(' ')] ?? FALLBACK

const topProbabilities = (logits, temperature) => {
  const words = Object.keys(logits)
  const probs = softmaxRow(words.map((w) => logits[w] / temperature))
  return words.map((word, i) => ({ word, logit: logits[word], p: probs[i] })).sort((a, b) => b.p - a.p)
}

const sampleFrom = (rows) => {
  let r = Math.random()
  for (const row of rows) {
    r -= row.p
    if (r <= 0) return row.word
  }
  return rows[rows.length - 1].word
}

export default function Generation() {
  const [written, setWritten] = useState([])
  const [temperature, setTemperature] = useState(1)

  const done = written[written.length - 1] === '<eos>'
  const rows = topProbabilities(logitsFor(written), temperature)

  const choose = (word) => !done && setWritten((w) => [...w, word])

  return (
    <Section
      id="generation"
      num="08"
      kicker="Step 8 · Words come out"
      title="Linear → Softmax → next token"
      lead="The decoder’s final vector for the last position is turned into a score for every word in the vocabulary. Softmax converts scores to probabilities. Pick one, append it, and run the decoder again."
    >
      <div className="steps-flow">
        <div className="flow-chip">Decoder vector</div><span className="op">→</span>
        <div className="flow-chip">Score for every word</div><span className="op">→</span>
        <div className="flow-chip">Softmax = %</div><span className="op">→</span>
        <div className="flow-chip">Pick one</div><span className="op">→</span>
        <div className="flow-chip">Add to sentence, repeat</div>
      </div>

      <div className="panel">
        <h4>Translate: “the cat sleeps” → French</h4>
        <div className="written">
          <span className="tok bos">&lt;bos&gt;</span>
          {written.map((w, i) => (
            <span key={i} className={`tok ${w === '<eos>' ? 'eos' : ''}`}>{w}</span>
          ))}
          {!done && <span className="cursor">▍</span>}
        </div>

        <label className="field-label">
          Temperature T = <b>{temperature.toFixed(2)}</b>
          <input type="range" min={0.1} max={2.5} step={0.05} value={temperature} onChange={(e) => setTemperature(+e.target.value)} />
        </label>
        <div className="slider-ends"><span>low → confident, repetitive</span><span>high → creative, risky</span></div>

        <div className="prob-list">
          {rows.map((r) => (
            <button key={r.word} className="prob-row" disabled={done} onClick={() => choose(r.word)} title="Click to pick this word">
              <span className="prob-word">{r.word}</span>
              <span className="prob-track"><span className="prob-fill" style={{ width: `${r.p * 100}%` }} /></span>
              <span className="prob-pct">{(r.p * 100).toFixed(1)}%</span>
            </button>
          ))}
        </div>

        <div className="controls">
          <button className="btn" disabled={done} onClick={() => choose(rows[0].word)}>Greedy: pick the top word</button>
          <button className="btn" disabled={done} onClick={() => choose(sampleFrom(rows))}>🎲 Sample from probabilities</button>
          <button className="btn ghost" onClick={() => setWritten([])}>↺ Start over</button>
        </div>
        <p className="muted small">
          Click any bar to force that word. Each time, the new word is fed back in and the whole decoder runs again — this loop is called
          <b> autoregressive generation</b>. It stops when the model emits <code>&lt;eos&gt;</code> (end of sequence).
        </p>
      </div>

      <div className="grid-2">
        <Callout type="intuition" title="Temperature">
          Dividing the scores by T before the softmax reshapes the distribution. T → 0 makes the top word almost certain (greedy). T = 1 keeps
          the model’s own beliefs. T &gt; 1 flattens it so unlikely words get a chance.
        </Callout>
        <Callout type="note" title="Beyond greedy">
          Real systems also use <b>top-k</b> (sample only from the k best words), <b>top-p</b> (the smallest set whose probabilities add up to p)
          and <b>beam search</b> (keep several candidate sentences alive).
        </Callout>
      </div>

      <Callout type="warn">
        The probabilities come from a tiny hand-written table, not a trained network — the point is to see how scores, temperature and the
        feedback loop work. A real model computes these scores from the decoder vector for every one of its 30 000+ words.
      </Callout>
    </Section>
  )
}
