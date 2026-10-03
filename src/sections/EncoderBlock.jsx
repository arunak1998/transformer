import { useEffect, useState } from 'react'
import Section from '../components/Section'
import Callout from '../components/Callout'
import VectorBars from '../components/VectorBars'
import EncoderMath from './EncoderMath'
import { layerNormRow } from '../lib/linalg'

const WORDS = ['The', 'cat', 'licked', 'its', 'paw']
const WORD_COLORS = ['#ffc46b', '#ff7ab8', '#5ee0ff', '#b6ff7a', '#a78bfa']

/* ================= 1. The big picture: one encoder block as a tower ================= */

const STAGES = [
  { name: 'Input', color: '#a78bfa', text: 'Each word enters as its numbers (meaning + position). Right now every word only knows about itself.' },
  { name: 'Self-attention', color: '#ff7ab8', text: 'Words talk to each other. Each word collects information from the words that matter to it (thicker line = more attention). This is the Query / Key / Value step.' },
  { name: 'Add & Norm', color: '#5ee0ff', text: 'Add: the “skip” arrow on the left keeps a copy of the original and adds the new information on top, so nothing is lost. Norm: tidy the numbers so none get too big.' },
  { name: 'Feed-forward', color: '#b6ff7a', text: 'Now each word thinks on its own. The same small neural network runs on every word separately and turns the collected clues into conclusions.' },
  { name: 'Add & Norm', color: '#5ee0ff', text: 'Same trick again: keep the original, add the new conclusions, tidy up.' },
  { name: 'Output', color: '#ffc46b', text: 'Same 5 words, same shape — but every word now understands its role in the sentence. This goes into the next block (×N), and finally to the decoder.' },
]

// What each word "knows" — added at the stage given by `at`.
const KNOWLEDGE = [
  [{ t: 'article', at: 0 }, { t: 'goes with: cat', at: 1 }, { t: '→ a specific cat', at: 3 }],
  [{ t: 'animal', at: 0 }, { t: 'does: licked', at: 1 }, { t: '→ the one licking', at: 3 }],
  [{ t: 'action', at: 0 }, { t: 'who: cat', at: 1 }, { t: 'what: paw', at: 1 }, { t: '→ cat licked paw', at: 3 }],
  [{ t: 'pronoun', at: 0 }, { t: 'refers to: cat', at: 1 }, { t: '→ means “the cat’s”', at: 3 }],
  [{ t: 'body part', at: 0 }, { t: 'action: licked', at: 1 }, { t: 'owner: its', at: 1 }, { t: '→ the cat’s paw', at: 3 }],
]

// Illustrative attention: row = word that is looking, column = word looked at.
const ATT = [
  [0.1, 0.6, 0.1, 0.1, 0.1],
  [0.05, 0.2, 0.6, 0.05, 0.1],
  [0.05, 0.4, 0.1, 0.05, 0.4],
  [0.05, 0.75, 0.05, 0.1, 0.05],
  [0.05, 0.1, 0.4, 0.35, 0.1],
]

const X = WORDS.map((_, j) => 110 + j * 125)
const Y = { out: 18, an2: 98, ffnTop: 150, ffnMid: 196, ffnBot: 242, an1: 280, attn: 330, inp: 446 }
const BAR_H = 18
const CARD_W = 92
const CARD_H = 40

function MiniNet({ x }) {
  const top = [-18, 0, 18]
  const mid = [-36, -18, 0, 18, 36]
  return (
    <g>
      {top.flatMap((a) => mid.map((b) => <line key={`t${a}${b}`} x1={x + a} y1={Y.ffnTop} x2={x + b} y2={Y.ffnMid} className="net-line" />))}
      {mid.flatMap((a) => top.map((b) => <line key={`b${a}${b}`} x1={x + a} y1={Y.ffnMid} x2={x + b} y2={Y.ffnBot} className="net-line" />))}
      {top.map((a) => <circle key={`n1${a}`} cx={x + a} cy={Y.ffnTop} r="5" className="net-node" />)}
      {mid.map((a) => <circle key={`n2${a}`} cx={x + a} cy={Y.ffnMid} r="5" className="net-node" />)}
      {top.map((a) => <circle key={`n3${a}`} cx={x + a} cy={Y.ffnBot} r="5" className="net-node" />)}
    </g>
  )
}

function Tower({ stage, setStage }) {
  const zone = (i) => `zone ${stage === i ? 'active' : i < stage ? 'past' : 'dim'}`
  const label = (i, y, text) => (
    <text x="690" y={y} className={`zone-label ${stage === i ? 'on' : ''}`} onClick={() => setStage(i)} fill={STAGES[i].color}>{text}</text>
  )
  const bar = (i, y) => (
    <g className={zone(i)} onClick={() => setStage(i)}>
      <rect x="60" y={y} width="600" height={BAR_H} rx="9" className="an-bar" />
      <text x="360" y={y + 13} textAnchor="middle" className="an-text">+ add the original · tidy the numbers</text>
    </g>
  )

  return (
    <svg viewBox="0 0 860 500" className="tower">
      {/* skip arrows (residual connections) */}
      <g className={zone(2)} onClick={() => setStage(2)}>
        <path d={`M ${X[0] - CARD_W / 2} ${Y.inp + 20} H 32 V ${Y.an1 + 9} H 58`} className="skip flowline" markerEnd="url(#arr)" />
        <text x="20" y={(Y.inp + Y.an1) / 2} className="skip-text" transform={`rotate(-90 20 ${(Y.inp + Y.an1) / 2})`}>skip: keep a copy</text>
      </g>
      <g className={zone(4)} onClick={() => setStage(4)}>
        <path d={`M 58 ${Y.an1 - 4} H 32 V ${Y.an2 + 9} H 58`} className="skip flowline" markerEnd="url(#arr)" />
        <text x="22" y={(Y.an1 + Y.an2) / 2} className="skip-text" transform={`rotate(-90 22 ${(Y.an1 + Y.an2) / 2})`}>skip</text>
      </g>
      <defs>
        <marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#5ee0ff" /></marker>
      </defs>

      {/* vertical connectors in each column */}
      {X.map((x, j) => (
        <g key={j} className="connector">
          <line x1={x} y1={Y.attn} x2={x} y2={Y.an1 + BAR_H} />
          <line x1={x} y1={Y.an1} x2={x} y2={Y.ffnBot + 6} />
          <line x1={x} y1={Y.ffnTop - 6} x2={x} y2={Y.an2 + BAR_H} />
          <line x1={x} y1={Y.an2} x2={x} y2={Y.out + CARD_H} />
        </g>
      ))}

      {/* self-attention: every word looks at every word */}
      <g className={zone(1)} onClick={() => setStage(1)}>
        <rect x="60" y={Y.attn - 14} width="600" height={Y.inp - Y.attn + 10} rx="14" className="zone-bg" />
        {ATT.flatMap((row, j) =>
          row.map((w, i) => (
            <line key={`${j}-${i}`} x1={X[j]} y1={Y.attn} x2={X[i]} y2={Y.inp} stroke="#ff7ab8" strokeWidth={0.6 + w * 7} opacity={0.12 + w * 0.88} strokeLinecap="round" className="flowline" />
          )),
        )}
        {X.map((x, j) => <circle key={j} cx={x} cy={Y.attn} r="7" fill="#ff7ab8" />)}
      </g>

      {bar(2, Y.an1)}

      {/* feed-forward: the same small network on every word */}
      <g className={zone(3)} onClick={() => setStage(3)}>
        <rect x="60" y={Y.ffnTop - 16} width="600" height={Y.ffnBot - Y.ffnTop + 32} rx="14" className="zone-bg" />
        {X.map((x, j) => <MiniNet key={j} x={x} />)}
      </g>

      {bar(4, Y.an2)}

      {/* input and output word cards */}
      {[{ y: Y.inp, i: 0 }, { y: Y.out, i: 5 }].map(({ y, i }) => (
        <g key={i} className={zone(i)} onClick={() => setStage(i)}>
          {WORDS.map((w, j) => (
            <g key={w}>
              <rect x={X[j] - CARD_W / 2} y={y} width={CARD_W} height={CARD_H} rx="10" className={`wcard ${i === 5 ? 'out' : ''}`} style={{ '--c': WORD_COLORS[j] }} />
              <text x={X[j]} y={y + 26} textAnchor="middle" className="wcard-text" fill={WORD_COLORS[j]}>{w}{i === 5 ? ' ✦' : ''}</text>
            </g>
          ))}
        </g>
      ))}

      {label(5, Y.out + 25, 'Output')}
      {label(4, Y.an2 + 13, 'Add & Norm')}
      {label(3, Y.ffnMid + 5, 'Feed-forward')}
      {label(2, Y.an1 + 13, 'Add & Norm')}
      {label(1, (Y.attn + Y.inp) / 2, 'Self-attention')}
      {label(0, Y.inp + 25, 'Input')}
    </svg>
  )
}

function EncoderPicture() {
  const [stage, setStage] = useState(0)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => {
      setStage((s) => {
        if (s >= 5) {
          setPlaying(false)
          return s
        }
        return s + 1
      })
    }, 3200)
    return () => clearInterval(id)
  }, [playing])

  const pick = (i) => { setPlaying(false); setStage(i) }

  return (
    <div className="panel main-panel">
      <h4>The whole encoder block in one picture</h4>
      <p className="muted">Data flows <b>upward</b>. Click a layer (or press Play) and watch what the words know at each stage.</p>

      <div className="xp-steps">
        {STAGES.map((s, i) => (
          <button key={i} className={`xp-step ${i === stage ? 'on' : ''} ${i < stage ? 'done' : ''}`} style={{ '--c': s.color }} onClick={() => pick(i)}>
            <span>{i + 1}</span>{s.name}
          </button>
        ))}
        <button className="btn small-btn" onClick={() => { setStage(0); setPlaying(true) }}>▶ Play</button>
      </div>

      <div className="tower-layout">
        <div className="visual-scroll tower-wrap"><Tower stage={stage} setStage={pick} /></div>
        <div className="tower-side">
          <div className="xp-caption" style={{ '--c': STAGES[stage].color }}>
            <b>{STAGES[stage].name}.</b> {STAGES[stage].text}
          </div>
          <div className="mini-title">What each word knows now</div>
          <div className="know">
            {WORDS.map((w, j) => (
              <div key={w} className="know-row">
                <span className="know-word" style={{ color: WORD_COLORS[j] }}>{w}</span>
                <div className="know-chips">
                  {KNOWLEDGE[j].filter((k) => k.at <= stage).map((k) => (
                    <span key={k.t} className={`kchip ${k.at === 3 ? 'concl' : k.at === 1 ? 'ctx' : ''} ${k.at === stage ? 'new' : ''}`}>{k.t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="muted small">Gray = what the word is · pink = learned from other words · green = conclusions from thinking</p>
        </div>
      </div>
    </div>
  )
}

/* ================= 2. Feed-forward, explained ================= */

const DETECTORS = ['is a pronoun', 'refers to an animal', 'is an action', 'is the doer', 'is a body part', 'belongs to someone']
// Illustrative detector scores per word (before ReLU).
const DETECT = [
  [-1.0, 0.8, -1.5, -0.6, -1.2, -0.9],
  [-1.4, -0.3, -0.8, 1.6, -1.1, -0.7],
  [-1.2, -0.9, 1.8, -0.5, -1.0, -1.3],
  [1.7, 1.4, -1.1, -0.6, -0.9, -0.4],
  [-1.3, -0.6, -0.9, -1.0, 1.5, 1.2],
]
const FFN_RESULT = [
  '“The” → points at a specific animal: the cat.',
  '“cat” → is the one doing the action.',
  '“licked” → is the action of the sentence.',
  '“its” → is a pronoun for an animal: it means “the cat’s”.',
  '“paw” → is a body part that belongs to someone.',
]

function FeedForward() {
  const [wi, setWi] = useState(3)
  const scores = DETECT[wi]
  const fired = DETECTORS.filter((_, i) => scores[i] > 0)

  return (
    <div className="panel">
      <h4>How the feed-forward network “thinks”</h4>
      <p className="muted">
        Think of it as a row of <b>detectors</b>. Each one checks a single pattern in the word’s numbers. If the pattern is there it lights up; if not,
        it switches off. Pick a word:
      </p>
      <div className="focus-row">
        {WORDS.map((w, i) => (
          <button key={w} className={`pill ${i === wi ? 'active' : ''}`} onClick={() => setWi(i)}>{w}</button>
        ))}
      </div>

      <div className="ffn">
        <div className="ffn-col">
          <div className="ffn-step"><span>1</span> Expand</div>
          <div className="ffn-word" style={{ '--c': WORD_COLORS[wi] }}>{WORDS[wi]}</div>
          <p className="muted small">The word’s numbers are sent to many detectors at once (real models: about 4× more detectors than numbers).</p>
        </div>
        <div className="ffn-arrow">→</div>
        <div className="ffn-col wide">
          <div className="ffn-step"><span>2</span> Detect, switch off negatives</div>
          {DETECTORS.map((d, i) => {
            const on = scores[i] > 0
            return (
              <div key={d} className={`det ${on ? 'on' : ''}`}>
                <span className="det-lamp" />
                <span className="det-name">{d}</span>
                <span className="det-score mono">{scores[i].toFixed(1)}</span>
                <span className="det-out mono">{on ? `→ ${scores[i].toFixed(1)}` : '→ 0'}</span>
              </div>
            )
          })}
          <p className="muted small">Negative score → switched off (0). This on/off rule is called <b>ReLU</b>.</p>
        </div>
        <div className="ffn-arrow">→</div>
        <div className="ffn-col">
          <div className="ffn-step"><span>3</span> Write back</div>
          <div className="ffn-facts">
            {fired.map((f) => <span key={f} className="kchip concl new">✓ {f}</span>)}
          </div>
          <p className="ffn-result">{FFN_RESULT[wi]}</p>
          <p className="muted small">The lit detectors are squeezed back to the original size and added to the word.</p>
        </div>
      </div>
      <Callout type="intuition" title="Attention vs. feed-forward">
        <b>Attention</b> = words share information with each other. <b>Feed-forward</b> = each word, alone, thinks about what it has collected.
        Every block does both, in that order.
      </Callout>
    </div>
  )
}

/* ================= 3. Add & Norm, explained ================= */

const BEFORE_NORM = [4.2, -1.0, 6.0, 0.8]

function AddAndNorm() {
  return (
    <div className="grid-2">
      <div className="panel">
        <h4>➕ Add: keep the original</h4>
        <p className="muted">Each layer’s result is <b>added</b> to what the word already had, instead of replacing it.</p>
        <div className="addviz">
          <span className="kchip">cat: animal</span>
          <span className="op">+</span>
          <span className="kchip ctx">does: licked</span>
          <span className="op">=</span>
          <span className="kchip both">cat: animal, does: licked</span>
        </div>
        <p className="muted small">Nothing gets lost, and very deep stacks of blocks stay easy to train. Also called a residual or skip connection.</p>
      </div>
      <div className="panel">
        <h4>🎚️ Norm: tidy the numbers</h4>
        <p className="muted">Like a volume knob: numbers that got too loud are brought back to a calm, even level.</p>
        <div className="addviz">
          <div>
            <div className="mini-title">before</div>
            <VectorBars values={BEFORE_NORM} limit={6} />
          </div>
          <span className="op">→</span>
          <div>
            <div className="mini-title">after</div>
            <VectorBars values={layerNormRow(BEFORE_NORM)} limit={2} />
          </div>
        </div>
        <p className="muted small">The pattern stays the same, only the size changes. This is called LayerNorm.</p>
      </div>
    </div>
  )
}

export default function EncoderBlock() {
  return (
    <Section
      id="encoder"
      num="06"
      kicker="Step 6 · The Encoder"
      title="Inside an encoder block"
      lead="An encoder block takes the words, lets them share information (attention), lets each one think (feed-forward), and passes them on. The shape never changes, so blocks are stacked again and again."
    >
      <EncoderPicture />
      <FeedForward />
      <AddAndNorm />

      <Callout type="note" title="Stack it N times">
        One block gives each word a bit more understanding. The original Transformer stacks 6 blocks; GPT-3 stacks 96. Early blocks tend to learn
        grammar, later blocks learn meaning. The final output goes to the decoder.
      </Callout>

      <details className="more">
        <summary>For the curious: every step as matrices</summary>
        <EncoderMath />
      </details>
    </Section>
  )
}
