import { useState } from 'react'
import Section from '../components/Section'
import Callout from '../components/Callout'
import Matrix from '../components/Matrix'
import Steps from '../components/Steps'
import Tex from '../components/Tex'
import QkvStory from '../components/QkvStory'
import SoftmaxPlayground from '../components/SoftmaxPlayground'
import { attention, transpose } from '../lib/linalg'
import { TOKENS, X0, WQ0, WK0, WV0, ROLE_COLOR } from '../lib/demo'

const STEP_LABELS = ['Input X', 'Make Q, K, V', 'Scores QKᵀ', 'Scale', 'Softmax', 'Mix the Values']
const D_LABELS = ['d₁', 'd₂', 'd₃', 'd₄']
const K_LABELS = ['f₁', 'f₂']

const n = (v) => (Number.isInteger(v) ? String(v) : v.toFixed(2))
const paren = (v) => (v < 0 ? `(${n(v)})` : n(v))

const setCell = (setter) => (i, j, v) => setter((M) => M.map((row, r) => row.map((x, c) => (r === i && c === j ? v : x))))

function StepInfo({ step }) {
  const info = [
    {
      text: 'Each row is one token as a vector of numbers (from embedding + position). Edit any number — everything below updates live.',
      tex: 'X\\in\\mathbb{R}^{n\\times d_{model}}',
    },
    {
      text: 'The same X is multiplied by three different learned matrices. This gives every token a Query (what I’m looking for), a Key (what I offer) and a Value (the information I carry).',
      tex: 'Q=XW^Q,\\quad K=XW^K,\\quad V=XW^V',
    },
    {
      text: 'Row i of Q is compared with every Key using a dot product. A big number means “token j is relevant to token i”.',
      tex: '\\text{scores}=QK^{\\top}\\qquad \\text{scores}_{ij}=\\mathbf q_i\\cdot\\mathbf k_j',
    },
    {
      text: 'Divide by √d_k (here √2 ≈ 1.41) so scores don’t explode when vectors get long. See the experiment further below.',
      tex: '\\frac{QK^{\\top}}{\\sqrt{d_k}}',
    },
    {
      text: 'Softmax turns each row into positive weights that sum to 1 — a probability distribution over “which tokens should I listen to?”.',
      tex: '\\text{softmax}(z)_j=\\frac{e^{z_j}}{\\sum_m e^{z_m}}',
    },
    {
      text: 'Each token’s new vector is a weighted average of all Value vectors, using its attention weights. Information has flowed between tokens.',
      tex: '\\text{Attention}(Q,K,V)=\\text{softmax}\\!\\Big(\\frac{QK^{\\top}}{\\sqrt{d_k}}\\Big)V',
    },
  ][step]
  return (
    <div className="step-info">
      <p>{info.text}</p>
      <Tex block>{info.tex}</Tex>
    </div>
  )
}

function Equation({ children }) {
  return <div className="flow-row">{children}</div>
}

function StepVisual({ step, st, setters, qi }) {
  const { X, Wq, Wk, Wv, r } = st
  const rows = TOKENS
  const common = { rowLabels: rows, highlightRow: qi }

  if (step === 0) {
    return <Matrix name="X" data={X} color={ROLE_COLOR.x} colLabels={D_LABELS} onChange={setters.X} {...common} />
  }
  if (step === 1) {
    const roles = [
      ['Q', Wq, r.Q, ROLE_COLOR.q, setters.Wq],
      ['K', Wk, r.K, ROLE_COLOR.k, setters.Wk],
      ['V', Wv, r.V, ROLE_COLOR.v, setters.Wv],
    ]
    return (
      <div className="stack-rows">
        {roles.map(([name, W, out, color, set]) => (
          <Equation key={name}>
            <Matrix name="X" data={X} color={ROLE_COLOR.x} {...common} />
            <div className="op">×</div>
            <Matrix name={`W${name}`} data={W} color={color} onChange={set} colLabels={K_LABELS} />
            <div className="op">=</div>
            <Matrix name={name} data={out} color={color} colLabels={K_LABELS} {...common} />
          </Equation>
        ))}
      </div>
    )
  }
  if (step === 2) {
    return (
      <Equation>
        <Matrix name="Q" data={r.Q} color={ROLE_COLOR.q} {...common} />
        <div className="op">×</div>
        <Matrix name="Kᵀ" data={transpose(r.K)} color={ROLE_COLOR.k} colLabels={rows} />
        <div className="op">=</div>
        <Matrix name="scores" data={r.raw} color="#ffc46b" colLabels={rows} {...common} />
      </Equation>
    )
  }
  if (step === 3) {
    return (
      <Equation>
        <Matrix name="scores" data={r.raw} color="#ffc46b" colLabels={rows} {...common} />
        <div className="op">÷ √{Wq[0].length}</div>
        <div className="op">=</div>
        <Matrix name="scaled" data={r.scaled} digits={2} color="#ffc46b" colLabels={rows} {...common} />
      </Equation>
    )
  }
  if (step === 4) {
    return (
      <Equation>
        <Matrix name="scaled" data={r.scaled} digits={2} color="#ffc46b" colLabels={rows} {...common} />
        <div className="op">softmax<br />per row</div>
        <Matrix name="attention weights A" data={r.weights} digits={2} color="#ff7ab8" colLabels={rows} maxValue={1} {...common} />
        <div className="rowsums">
          <div className="mini-title">Σ row</div>
          {r.weights.map((row, i) => (
            <div key={i} className="rowsum">{row.reduce((a, b) => a + b, 0).toFixed(2)}</div>
          ))}
        </div>
      </Equation>
    )
  }
  return (
    <Equation>
      <Matrix name="A" data={r.weights} digits={2} color="#ff7ab8" colLabels={rows} maxValue={1} {...common} />
      <div className="op">×</div>
      <Matrix name="V" data={r.V} color={ROLE_COLOR.v} {...common} />
      <div className="op">=</div>
      <Matrix name="output Z" data={r.out} digits={2} color="#a78bfa" colLabels={K_LABELS} {...common} />
    </Equation>
  )
}


export default function SelfAttention() {
  const [X, setX] = useState(X0)
  const [Wq, setWq] = useState(WQ0)
  const [Wk, setWk] = useState(WK0)
  const [Wv, setWv] = useState(WV0)
  const [step, setStep] = useState(0)
  const [qi, setQi] = useState(1)

  const r = attention(X, Wq, Wk, Wv)
  const st = { X, Wq, Wk, Wv, r }
  const setters = { X: setCell(setX), Wq: setCell(setWq), Wk: setCell(setWk), Wv: setCell(setWv) }
  const reset = () => {
    setX(X0); setWq(WQ0); setWk(WK0); setWv(WV0)
  }

  return (
    <Section
      id="attention"
      num="04"
      kicker="Step 4 · The heart of the Transformer"
      title="Self-Attention: Query, Key, Value"
      lead="Every word needs to understand the words around it. Attention lets a word ask a question, find the words that answer it, and take in their information."
    >
      <div className="grid-3">
        <div className="card role-card" style={{ '--c': ROLE_COLOR.q }}>
          <div className="role-icon">🔎</div>
          <h4 style={{ color: ROLE_COLOR.q }}>Query</h4>
          <p>What I am <b>searching for</b>. Like the words you type into a search box.</p>
        </div>
        <div className="card role-card" style={{ '--c': ROLE_COLOR.k }}>
          <div className="role-icon">🏷️</div>
          <h4 style={{ color: ROLE_COLOR.k }}>Key</h4>
          <p>The <b>tags</b> I wear. Like the title and tags of a video.</p>
        </div>
        <div className="card role-card" style={{ '--c': ROLE_COLOR.v }}>
          <div className="role-icon">📦</div>
          <h4 style={{ color: ROLE_COLOR.v }}>Value</h4>
          <p>The <b>information</b> I give. Like the video itself, which you watch if it matches.</p>
        </div>
      </div>
      <p className="muted center">Search → match the tags → take the content of the best matches. That is all attention is.</p>

      <QkvStory />

      <Callout type="intuition" title="From tags to numbers">
        In a real model there are no readable tags. Each Query and Key is a list of learned numbers, and “counting matching tags” becomes
        <b> multiplying the numbers pair by pair and adding them up</b> (called the dot product). It is exactly the same idea: things that fit get a high score.
      </Callout>

      <SoftmaxPlayground />

      <details className="more">
        <summary>For the curious: the same thing as matrix math (editable, 4 words)</summary>
        <Tex block>{'\\text{Attention}(Q,K,V)=\\text{softmax}\\!\\Big(\\frac{QK^{\\top}}{\\sqrt{d_k}}\\Big)V'}</Tex>
        <p className="muted small">The whole sentence is processed at once with matrices. Change any number and the page above updates.</p>
        <Steps labels={STEP_LABELS} value={step} onChange={setStep} />
        <StepInfo step={step} />
        <div className="focus-row">
          <button className="btn ghost small-btn" onClick={reset}>↺ reset numbers</button>
        </div>
        <div className="visual-scroll">
          <StepVisual step={step} st={st} setters={setters} qi={qi} />
        </div>
      </details>

      <Callout type="note" title="Who decides the numbers?">
        The matrices that make Q, K and V are <b>learned</b>. They start random and get adjusted over billions of examples, until the questions and labels
        match in useful ways. Nobody writes grammar rules by hand.
      </Callout>
    </Section>
  )
}
