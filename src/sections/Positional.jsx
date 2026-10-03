import { useState } from 'react'
import Section from '../components/Section'
import Callout from '../components/Callout'
import Dots from '../components/Dots'
import Tex from '../components/Tex'

const POS_COLORS = ['#ff7ab8', '#5ee0ff', '#b6ff7a', '#ffc46b']
const SPEEDS = [1, 0.45, 0.2] // how fast each "wheel" turns: fast, medium, slow
const ROWS = 10

// Smooth code for a position: sin and cos of each wheel → 6 numbers in [-1, 1].
const smoothCode = (pos) => SPEEDS.flatMap((s) => [Math.sin(pos * s), Math.cos(pos * s)])
// Lamp code: the position written in binary (fast lamp on the right).
const lampCode = (pos) => [(pos >> 2) & 1, (pos >> 1) & 1, pos & 1]

const WORD_MEANING = {
  The: [0.1, -0.2, 0.8, 0.3, -0.5, 0.4],
  cat: [0.9, 0.3, 0.7, -0.4, 0.2, -0.6],
  sat: [0.4, 0.9, -0.3, 0.6, -0.2, 0.1],
  down: [-0.5, 0.7, 0.2, 0.9, 0.5, -0.3],
}
const SENTENCE = ['The', 'cat', 'sat', 'down']

/* ---------- 1. the problem ---------- */

function OrderDemo() {
  const [tagsOn, setTagsOn] = useState(false)
  const sentences = [['dog', 'bites', 'man'], ['man', 'bites', 'dog']]

  return (
    <div className="panel main-panel">
      <h4>The problem: attention has no sense of order</h4>
      <p className="muted">These two sentences mean very different things. Switch position tags on and off to see what the model receives.</p>
      <div className="controls">
        <button className={`pill ${!tagsOn ? 'active' : ''}`} onClick={() => setTagsOn(false)}>Without position tags</button>
        <button className={`pill ${tagsOn ? 'active' : ''}`} onClick={() => setTagsOn(true)}>With position tags</button>
      </div>
      <div className="order-grid">
        {sentences.map((words, s) => (
          <div key={s} className="order-card">
            <div className="mini-title">sentence {s + 1}</div>
            <div className="order-sentence">{words.join(' ')}</div>
            <div className="order-arrow">↓ what the model receives</div>
            <div className="order-input">
              {(tagsOn ? words : [...words].sort()).map((w, i) => (
                <div key={w} className="order-token" style={tagsOn ? { '--c': POS_COLORS[i] } : { '--c': '#8b90ad' }}>
                  {tagsOn && <span className="order-badge">{i + 1}</span>}
                  {w}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className={`verdict ${tagsOn ? 'good' : 'bad'}`}>
        {tagsOn
          ? '✓ Different tags → different inputs. Now the model knows who bit whom.'
          : '✕ Just a bag of the same words — identical input! The model cannot tell the sentences apart.'}
      </div>
    </div>
  )
}

/* ---------- 2. a code for every position ---------- */

const MODES = {
  lamps: { label: '💡 Lamps (simple idea)', columns: ['fast', 'medium', 'slow'] },
  smooth: { label: '🌊 Smooth (what Transformers use)', columns: ['fast', '', 'medium', '', 'slow', ''] },
}

function Lamp({ on }) {
  return <span className={`lamp ${on ? 'on' : ''}`} />
}

function PositionCodes() {
  const [mode, setMode] = useState('lamps')
  const [sel, setSel] = useState(5)
  const code = mode === 'lamps' ? lampCode : smoothCode

  return (
    <div className="panel">
      <h4>The idea: give every position its own code</h4>
      <p className="muted">
        Think of a row of lamps that counts. The <b>right lamp</b> flips every step, the <b>middle</b> every 2 steps, the <b>left</b> every 4. Every
        position ends up with a different pattern, like a fingerprint. Click a row.
      </p>
      <div className="controls">
        {Object.entries(MODES).map(([key, m]) => (
          <button key={key} className={`pill ${mode === key ? 'active' : ''}`} onClick={() => setMode(key)}>{m.label}</button>
        ))}
      </div>

      <div className="codes">
        <div className="codes-head">
          <span />
          <div className="codes-cols" style={{ gridTemplateColumns: `repeat(${MODES[mode].columns.length}, 34px)` }}>
            {(mode === 'lamps' ? [...MODES.lamps.columns].reverse() : MODES.smooth.columns).map((c, i) => <span key={i}>{c}</span>)}
          </div>
        </div>
        {Array.from({ length: mode === 'lamps' ? 8 : ROWS }, (_, p) => {
          const values = code(p)
          return (
            <button key={p} className={`codes-row ${p === sel ? 'on' : ''}`} onClick={() => setSel(p)}>
              <span className="codes-pos">position {p}</span>
              <div className="codes-cols" style={{ gridTemplateColumns: `repeat(${values.length}, 34px)` }}>
                {mode === 'lamps' ? values.map((v, i) => <Lamp key={i} on={v === 1} />) : <Dots values={values} size={34} />}
              </div>
            </button>
          )
        })}
      </div>

      <p className="muted small">
        {mode === 'lamps'
          ? 'Position 5 = lamps on-off-on (binary 101). No two rows are the same.'
          : 'Same idea, but instead of on/off each lamp glides smoothly up and down (cyan = positive, pink = negative, bigger = stronger). Nearby positions get similar codes, far ones differ, so the model can sense “close” and “far”.'}
      </p>
    </div>
  )
}

/* ---------- 3. stamp the code on the word ---------- */

function AddTag() {
  const [wi, setWi] = useState(1)
  const word = SENTENCE[wi]
  const meaning = WORD_MEANING[word]
  const tag = smoothCode(wi + 1)
  const sum = meaning.map((v, i) => v + tag[i])

  return (
    <div className="panel">
      <h4>Stamp the code onto the word</h4>
      <p className="muted">The word’s meaning and the position code are simply added together. Pick a word:</p>
      <div className="pos-words">
        {SENTENCE.map((w, i) => (
          <button key={w} className={`pos-word ${i === wi ? 'on' : ''}`} style={{ '--c': POS_COLORS[i] }} onClick={() => setWi(i)}>
            <span className="order-badge">{i + 1}</span>
            {w}
          </button>
        ))}
      </div>
      <div className="stamp">
        <div className="stamp-item">
          <Dots values={meaning} />
          <div className="stamp-label">meaning of “{word}”</div>
        </div>
        <span className="op big-op">+</span>
        <div className="stamp-item">
          <Dots values={tag} />
          <div className="stamp-label">code for position {wi + 1}</div>
        </div>
        <span className="op big-op">=</span>
        <div className="stamp-item result">
          <Dots values={sum} />
          <div className="stamp-label">“{word}” at position {wi + 1}</div>
        </div>
      </div>
      <p className="muted small">
        Click through the words: the meaning stays, but the stamp changes, so each word enters the model knowing both <b>what</b> it is and <b>where</b> it sits.
      </p>
    </div>
  )
}

export default function Positional() {
  return (
    <Section
      id="positional"
      num="03"
      kicker="Step 3 · Where is each word?"
      title="Positional Encoding"
      lead="Attention looks at all words at once, like a bag of words. To give it a sense of order, every word gets a position code added to its numbers: a fingerprint of where it sits."
    >
      <OrderDemo />
      <PositionCodes />
      <AddTag />

      <Callout type="note" title="Simplified on purpose">
        Real models use many more “lamps” (hundreds), spread over a wide range of speeds. They are built from sine and cosine waves, which is exactly
        the smooth version above. Some newer models learn positions instead, or use a method called RoPE.
      </Callout>

      <details className="more">
        <summary>For the curious: the exact formula</summary>
        <Tex block>{'PE_{(pos,\\,2i)}=\\sin\\!\\Big(\\tfrac{pos}{10000^{2i/d}}\\Big)\\qquad PE_{(pos,\\,2i+1)}=\\cos\\!\\Big(\\tfrac{pos}{10000^{2i/d}}\\Big)'}</Tex>
        <p className="muted small">Early numbers change fast with position, later ones slowly — just like the lamps.</p>
      </details>
    </Section>
  )
}
