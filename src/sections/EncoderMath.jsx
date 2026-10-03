import { useMemo, useState } from 'react'
import Matrix from '../components/Matrix'
import Steps from '../components/Steps'
import Tex from '../components/Tex'
import { TOKENS, X0, D_MODEL } from '../lib/demo'
import { multiHeadAttention } from '../lib/multihead'
import { add, matmul, randomMatrix, relu, layerNormRow } from '../lib/linalg'

const STEP_LABELS = ['Self-attention', 'Add (residual)', 'LayerNorm', 'Feed-forward', 'Add & Norm again']
const FFN_HIDDEN = 8

const layerNorm = (M) => M.map((row) => layerNormRow(row))

// Runs one full encoder block and returns every intermediate matrix.
const runEncoderBlock = (X) => {
  const attn = multiHeadAttention(X, 2, 3).out
  const summed1 = add(X, attn)
  const normed1 = layerNorm(summed1)
  const W1 = randomMatrix(D_MODEL, FFN_HIDDEN, 21, 1)
  const W2 = randomMatrix(FFN_HIDDEN, D_MODEL, 22, 1)
  const hidden = relu(matmul(normed1, W1))
  const ffn = matmul(hidden, W2)
  const summed2 = add(normed1, ffn)
  const out = layerNorm(summed2)
  return { attn, summed1, normed1, W1, W2, hidden, ffn, summed2, out }
}

const stat = (row) => {
  const mean = row.reduce((a, b) => a + b, 0) / row.length
  const variance = row.reduce((a, b) => a + (b - mean) ** 2, 0) / row.length
  return { mean, variance, std: Math.sqrt(variance + 1e-5) }
}

function LayerNormDetail({ row, token }) {
  const { mean, variance, std } = stat(row)
  const normed = layerNormRow(row)
  return (
    <div className="panel">
      <h4>LayerNorm on one token: “{token}”</h4>
      <div className="mono ln-line">input x = [{row.map((v) => v.toFixed(2)).join(', ')}]</div>
      <div className="mono ln-line">mean μ = {mean.toFixed(3)} &nbsp; variance σ² = {variance.toFixed(3)} &nbsp; σ = {std.toFixed(3)}</div>
      <div className="mono ln-line">(x − μ) / σ = [{normed.map((v) => v.toFixed(2)).join(', ')}]</div>
      <Tex block>{'\\text{LayerNorm}(\\mathbf x)=\\gamma\\odot\\frac{\\mathbf x-\\mu}{\\sqrt{\\sigma^2+\\epsilon}}+\\beta'}</Tex>
      <p className="muted small">
        After normalizing, the vector has mean 0 and variance 1 (γ and β are learned scale/shift, shown as 1 and 0 here). This keeps numbers
        in a healthy range as dozens of layers are stacked.
      </p>
    </div>
  )
}

// The full block as matrices, for the "For the curious" box.
export default function EncoderMath() {
  const [step, setStep] = useState(0)
  const [ti, setTi] = useState(1)
  const run = useMemo(() => runEncoderBlock(X0), [])
  const common = { rowLabels: TOKENS, highlightRow: ti, digits: 2, cellWidth: 50 }

  const visuals = [
    <div className="flow-row" key={0}>
      <Matrix name="X" data={X0} color="#a78bfa" {...common} digits={0} />
      <div className="op">→ multi-head<br />attention →</div>
      <Matrix name="Attention(X)" data={run.attn} color="#7affd0" {...common} />
    </div>,
    <div className="flow-row" key={1}>
      <Matrix name="X" data={X0} color="#a78bfa" {...common} digits={0} />
      <div className="op">+</div>
      <Matrix name="Attention(X)" data={run.attn} color="#7affd0" {...common} />
      <div className="op">=</div>
      <Matrix name="X + Attention(X)" data={run.summed1} color="#ffc46b" {...common} />
    </div>,
    <div className="flow-row" key={2}>
      <Matrix name="before" data={run.summed1} color="#ffc46b" {...common} />
      <div className="op">LayerNorm<br />each row →</div>
      <Matrix name="after" data={run.normed1} color="#5ee0ff" {...common} />
    </div>,
    <div className="flow-row" key={3}>
      <Matrix name="x" data={run.normed1} color="#5ee0ff" {...common} />
      <div className="op">W₁, ReLU →</div>
      <Matrix name={`hidden (n × ${FFN_HIDDEN})`} data={run.hidden} color="#ff7ab8" {...common} cellWidth={42} />
      <div className="op">W₂ →</div>
      <Matrix name="FFN(x)" data={run.ffn} color="#b6ff7a" {...common} />
    </div>,
    <div className="flow-row" key={4}>
      <Matrix name="x" data={run.normed1} color="#5ee0ff" {...common} />
      <div className="op">+</div>
      <Matrix name="FFN(x)" data={run.ffn} color="#b6ff7a" {...common} />
      <div className="op">→ LayerNorm →</div>
      <Matrix name="encoder block output" data={run.out} color="#a78bfa" {...common} />
    </div>,
  ]

  const notes = [
    'Multi-head attention mixes information between tokens (from the previous section).',
    'The residual connection adds the original input back. The block only needs to learn a correction, and gradients can flow straight through during training.',
    'Each token vector is rescaled to mean 0 and variance 1.',
    'A small two-layer neural network is applied to every token separately and identically: expand to a wider space (here 4 → 8), apply ReLU, project back (8 → 4). Attention mixes tokens; the FFN “thinks” about each one.',
    'Another residual + LayerNorm. The output has the same shape as the input, so blocks can be stacked N times (6 in the original paper, 96 in GPT-3).',
  ]

  return (
    <>
      <Tex block>{'\\mathbf h=\\text{LayerNorm}\\big(X+\\text{MultiHead}(X)\\big),\\qquad \\text{out}=\\text{LayerNorm}\\big(\\mathbf h+\\text{FFN}(\\mathbf h)\\big)'}</Tex>
      <div className="focus-row">
        <span className="muted small">Highlight token:</span>
        {TOKENS.map((t, i) => (
          <button key={t} className={`pill small ${i === ti ? 'active' : ''}`} onClick={() => setTi(i)}>{t}</button>
        ))}
      </div>
      <Steps labels={STEP_LABELS} value={step} onChange={setStep} />
      <p className="step-note">{notes[step]}</p>
      <div className="visual-scroll">{visuals[step]}</div>
      {(step === 2 || step === 4) && (
        <LayerNormDetail row={step === 2 ? run.summed1[ti] : run.summed2[ti]} token={TOKENS[ti]} />
      )}
    </>
  )
}
