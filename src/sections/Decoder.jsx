import { useEffect, useState } from 'react'
import Section from '../components/Section'
import Callout from '../components/Callout'
import AttentionLines from '../components/AttentionLines'
import Tex from '../components/Tex'

const SOURCE = ['the', 'cat', 'sleeps']
const TARGET = ['le', 'chat', 'dort', '<eos>']
const DEC_WORDS = ['<bos>', 'le', 'chat', 'dort']

// Illustrative numbers: how the newest written word looks back at the words so far.
const LOOK_BACK = [[1], [0.3, 0.7], [0.15, 0.25, 0.6], [0.1, 0.15, 0.3, 0.45]]
// Illustrative numbers: how it looks at the English words.
const LOOK_SOURCE = [[0.7, 0.2, 0.1], [0.1, 0.8, 0.1], [0.05, 0.15, 0.8], [0.2, 0.2, 0.6]]
// Illustrative next-word guesses.
const NEXT_WORD = [
  [['le', 0.78], ['la', 0.09], ['un', 0.06], ['other', 0.07]],
  [['chat', 0.85], ['chien', 0.08], ['noir', 0.04], ['other', 0.03]],
  [['dort', 0.82], ['mange', 0.1], ['est', 0.05], ['other', 0.03]],
  [['<eos>', 0.7], ['.', 0.2], ['profondément', 0.07], ['other', 0.03]],
]

const STAGES = [
  { title: 'Look back', color: '#ffc46b' },
  { title: 'Look at the source', color: '#ff7ab8' },
  { title: 'Think', color: '#b6ff7a' },
  { title: 'Pick the word', color: '#5ee0ff' },
]

const CAPTIONS = [
  (w) => `Masked attention: “${w}” rereads the words already written. Words that don’t exist yet are locked out — no peeking at the future.`,
  (w) => `Cross-attention: “${w}” checks the encoder’s notes about the English sentence. Thicker line = more important for the next word.`,
  () => 'Feed-forward: a small neural network mixes everything that was gathered. No new looking, just thinking.',
  () => 'Linear + softmax: every word in the vocabulary gets a probability. The best one is written down, and the loop starts again.',
]

function Chips({ words, color, ghost }) {
  return (
    <div className="dchips">
      {words.map((w, i) => <span key={i} className="dchip" style={{ '--c': color }}>{w}</span>)}
      {ghost && <span className="dchip ghost">?</span>}
    </div>
  )
}

function ThinkingNet() {
  const layers = [4, 6, 4]
  const x = (l) => 70 + l * 190
  const y = (l, i) => 20 + ((i + 0.5) * 130) / layers[l]
  return (
    <svg viewBox="0 0 450 170" className="think-net">
      {layers.slice(0, -1).flatMap((n, l) =>
        Array.from({ length: n }, (_, i) =>
          Array.from({ length: layers[l + 1] }, (_, j) => (
            <line key={`${l}-${i}-${j}`} x1={x(l)} y1={y(l, i)} x2={x(l + 1)} y2={y(l + 1, j)} className="think-line" style={{ animationDelay: `${(i + j) * 0.12}s` }} />
          )),
        ),
      )}
      {layers.map((n, l) => Array.from({ length: n }, (_, i) => <circle key={`${l}-${i}`} cx={x(l)} cy={y(l, i)} r="9" className="think-dot" />))}
      <text x={x(0)} y="166" textAnchor="middle" className="side-label">gathered info</text>
      <text x={x(2)} y="166" textAnchor="middle" className="side-label">ready to choose</text>
    </svg>
  )
}

function NextWordBars({ t }) {
  const rows = NEXT_WORD[t]
  return (
    <div className="dnext">
      {rows.map(([word, p], i) => (
        <div key={word} className={`dnext-row ${i === 0 ? 'win' : ''}`}>
          <span className="mono">{word}</span>
          <div className="dnext-track"><div style={{ width: `${p * 100}%` }} /></div>
          <b className="mono">{Math.round(p * 100)}%</b>
        </div>
      ))}
    </div>
  )
}

// The main interactive: write the French sentence one word at a time.
function WriteTheSentence() {
  const [tick, setTick] = useState(0) // 4 stages per word → 16 ticks
  const [playing, setPlaying] = useState(false)
  const t = Math.floor(tick / 4)
  const stage = tick % 4
  const written = DEC_WORDS.slice(0, t + 1)
  const lastWord = written[written.length - 1]

  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => {
      setTick((k) => {
        if (k >= 15) {
          setPlaying(false)
          return k
        }
        return k + 1
      })
    }, 2800)
    return () => clearInterval(id)
  }, [playing])

  const goStage = (i) => { setPlaying(false); setTick(t * 4 + i) }
  const addWord = () => { setPlaying(false); setTick(Math.min(15, (t + 1) * 4)) }
  const restart = () => { setPlaying(false); setTick(0) }
  const play = () => { setTick(0); setPlaying(true) }
  const done = t === 3 && stage === 3

  return (
    <div className="panel main-panel">
      <h4>Watch the decoder write: “the cat sleeps” → French</h4>

      <div className="dstate">
        <div>
          <div className="mini-title">Encoder’s notes on the input</div>
          <Chips words={SOURCE} color="#5ee0ff" />
        </div>
        <div>
          <div className="mini-title">Written so far</div>
          <Chips words={t === 0 ? ['<bos>'] : written} color="#ff7ab8" ghost={!done} />
        </div>
      </div>

      <div className="xp-steps">
        {STAGES.map((s, i) => (
          <button key={s.title} className={`xp-step ${i === stage ? 'on' : ''} ${i < stage ? 'done' : ''}`} style={{ '--c': s.color }} onClick={() => goStage(i)}>
            <span>{i + 1}</span>{s.title}
          </button>
        ))}
        <button className="btn small-btn" onClick={play}>▶ Play all</button>
        <button className="btn ghost small-btn" onClick={restart} style={{ marginLeft: 0 }}>↺</button>
      </div>

      <div className="xp-caption" style={{ '--c': STAGES[stage].color }}>{CAPTIONS[stage](lastWord)}</div>

      <div className="dstage">
        {stage === 0 && (
          <AttentionLines tokens={DEC_WORDS} weights={[...LOOK_BACK[t], 0, 0, 0].slice(0, 4)} source={`“${lastWord}”`} lockedFrom={t + 1} color="#ffc46b" />
        )}
        {stage === 1 && <AttentionLines tokens={SOURCE} weights={LOOK_SOURCE[t]} source={`“${lastWord}”`} color="#ff7ab8" />}
        {stage === 2 && <ThinkingNet />}
        {stage === 3 && (
          <>
            <NextWordBars t={t} />
            <div className="center">
              {done ? (
                <div className="verdict good">✓ <b>&lt;eos&gt;</b> means “stop”. The sentence is finished: <b>le chat dort</b></div>
              ) : (
                <button className="btn" onClick={addWord}>Write “{NEXT_WORD[t][0][0]}” and continue →</button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function SeeGrid({ masked }) {
  return (
    <div className="see-grid" style={{ gridTemplateColumns: `90px repeat(${DEC_WORDS.length}, 64px)` }}>
      <div />
      {DEC_WORDS.map((w) => <div key={w} className="see-head">{w}</div>)}
      {DEC_WORDS.map((row, i) => (
        <div key={row} className="see-row">
          <div className="see-head left">{row}</div>
          {DEC_WORDS.map((col, j) => {
            const ok = !masked || j <= i
            return <div key={col} className={`see-cell ${ok ? 'yes' : 'no'}`}>{ok ? '✓' : '✕'}</div>
          })}
        </div>
      ))}
    </div>
  )
}

function MaskTrick() {
  const [masked, setMasked] = useState(true)
  return (
    <div className="panel">
      <h4>The mask, in one picture</h4>
      <p className="muted">
        Each row is a word, and the ✓ marks the words it may look at. In the decoder every word may only look <b>left</b> (at earlier words).
      </p>
      <div className="controls">
        <button className={`pill ${masked ? 'active' : ''}`} onClick={() => setMasked(true)}>Decoder (masked)</button>
        <button className={`pill ${!masked ? 'active' : ''}`} onClick={() => setMasked(false)}>Encoder (sees everything)</button>
      </div>
      <div className="visual-scroll"><SeeGrid masked={masked} /></div>
      <p className="muted small">
        Why bother? While <i>training</i>, the model is shown the whole correct sentence at once. The mask hides the answer from each position,
        so it still learns to predict the next word honestly — and all positions are practised in parallel.
      </p>
    </div>
  )
}

export default function Decoder() {
  return (
    <Section
      id="decoder"
      num="07"
      kicker="Step 7 · The Decoder"
      title="The Decoder: the writer"
      lead="The encoder has read the input and made notes. The decoder is the writer: it produces the answer one word at a time, and before every word it does the same four things."
    >
      <div className="grid-3 four">
        <div className="card" style={{ '--c': '#ffc46b' }}><h4>1 · Look back</h4><p>Reread the words I have already written.</p></div>
        <div className="card" style={{ '--c': '#ff7ab8' }}><h4>2 · Look at the source</h4><p>Check the encoder’s notes on the input.</p></div>
        <div className="card" style={{ '--c': '#b6ff7a' }}><h4>3 · Think</h4><p>Combine it all in a small neural network.</p></div>
        <div className="card" style={{ '--c': '#5ee0ff' }}><h4>4 · Pick the word</h4><p>Choose the most likely next word. Repeat.</p></div>
      </div>

      <WriteTheSentence />
      <MaskTrick />

      <Callout type="intuition" title="Query, Key, Value — same idea, two sources">
        Both “look” steps use the Query / Key / Value attention you already know. In <b>look back</b>, Q, K and V all come from the decoder’s own words.
        In <b>look at the source</b>, the Query comes from the decoder, but the Keys and Values come from the encoder’s notes.
      </Callout>

      <Callout type="warn" title="Honest note">
        The percentages in this demo are hand-written to show the typical pattern. A trained model computes them itself.
      </Callout>

      <Callout type="note" title="Decoder-only models">
        ChatGPT-style models keep only the decoder (look back → think → pick, with no source to look at). BERT keeps only the encoder. Translation
        models like the original Transformer use both.
      </Callout>

      <details className="more">
        <summary>For the curious: how the mask works in math</summary>
        <Tex block>{'\\text{Attention}=\\text{softmax}\\!\\Big(\\frac{QK^{\\top}}{\\sqrt{d_k}}+M\\Big)V,\\qquad M_{ij}=\\begin{cases}0&j\\le i\\\\-\\infty&j>i\\end{cases}'}</Tex>
        <p className="muted small">Adding −∞ to a score makes its softmax weight exactly 0, so the future is invisible.</p>
      </details>
    </Section>
  )
}
