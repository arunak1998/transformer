import { useState } from 'react'
import Section from '../components/Section'
import Callout from '../components/Callout'
import Matrix from '../components/Matrix'
import AttentionLines from '../components/AttentionLines'
import Tex from '../components/Tex'
import { TOKENS, X0, D_MODEL } from '../lib/demo'
import { multiHeadAttention } from '../lib/multihead'

const WORDS = ['The', 'cat', 'licked', 'its', 'paw']

// Four "detectives". Each head hunts for a different clue.
// weights[w] = how word w spreads its attention over the 5 words (illustrative, hand-written).
const HEADS = [
  {
    name: 'Who?', emoji: '🕵️', color: '#ff7ab8', clue: 'who',
    job: 'finds who is doing it',
    weights: [
      [0.2, 0.6, 0.05, 0.1, 0.05],
      [0.1, 0.6, 0.1, 0.1, 0.1],
      [0.05, 0.8, 0.05, 0.05, 0.05],
      [0.05, 0.8, 0.05, 0.05, 0.05],
      [0.05, 0.6, 0.2, 0.1, 0.05],
    ],
  },
  {
    name: 'What?', emoji: '🔍', color: '#5ee0ff', clue: 'what',
    job: 'finds what it is done to',
    weights: [
      [0.6, 0.2, 0.05, 0.05, 0.1],
      [0.05, 0.1, 0.1, 0.1, 0.65],
      [0.05, 0.05, 0.05, 0.05, 0.8],
      [0.05, 0.05, 0.05, 0.15, 0.7],
      [0.05, 0.05, 0.05, 0.05, 0.8],
    ],
  },
  {
    name: 'Action?', emoji: '⚡', color: '#b6ff7a', clue: 'action',
    job: 'finds the verb',
    weights: [
      [0.5, 0.1, 0.3, 0.05, 0.05],
      [0.05, 0.1, 0.8, 0.025, 0.025],
      [0.05, 0.05, 0.8, 0.05, 0.05],
      [0.05, 0.05, 0.75, 0.1, 0.05],
      [0.05, 0.05, 0.8, 0.05, 0.05],
    ],
  },
  {
    name: 'Next door', emoji: '👀', color: '#ffc46b', clue: 'neighbour',
    job: 'looks at the word just before',
    weights: [
      [0.8, 0.05, 0.05, 0.05, 0.05],
      [0.8, 0.05, 0.05, 0.05, 0.05],
      [0.05, 0.8, 0.05, 0.05, 0.05],
      [0.05, 0.05, 0.8, 0.05, 0.05],
      [0.05, 0.05, 0.05, 0.8, 0.05],
    ],
  },
]

const topWord = (weights) => weights.indexOf(Math.max(...weights))

function HeadCard({ head, on, qi, toggle }) {
  const row = head.weights[qi]
  const top = topWord(row)
  const found = top === qi ? 'mostly itself — no new clue' : `${WORDS[top]} (${Math.round(row[top] * 100)}%)`
  return (
    <div className={`mh-card ${on ? '' : 'off'}`} style={{ '--c': head.color }}>
      <div className="mh-top">
        <div>
          <div className="mh-name">{head.emoji} Head: {head.name}</div>
          <div className="mh-job">{head.job}</div>
        </div>
        <button className={`mh-switch ${on ? 'on' : ''}`} onClick={toggle} aria-label={`toggle ${head.name}`}><i /></button>
      </div>
      <AttentionLines tokens={WORDS} weights={row} selected={qi} source={`“${WORDS[qi]}”`} color={head.color} />
      <div className="mh-found">Found: <b>{found}</b></div>
    </div>
  )
}

function Team() {
  const [qi, setQi] = useState(2)
  const [enabled, setEnabled] = useState([true, true, true, true])
  const active = HEADS.filter((_, i) => enabled[i])
  const clues = active
    .map((h) => ({ h, top: topWord(h.weights[qi]) }))
    .filter(({ top }) => top !== qi)

  const toggle = (i) => setEnabled((e) => e.map((v, k) => (k === i ? !v : v)))

  return (
    <div className="panel main-panel">
      <h4>A team of detectives reads: “The cat licked its paw”</h4>
      <p className="muted">
        Every head reads the same sentence but hunts for a different clue. Pick a word, then switch heads on and off to see what the word learns.
      </p>
      <div className="focus-row">
        <span className="muted">Pick a word:</span>
        {WORDS.map((w, i) => (
          <button key={w} className={`pill ${i === qi ? 'active' : ''}`} onClick={() => setQi(i)}>{w}</button>
        ))}
        <button className="btn ghost small-btn" onClick={() => setEnabled([true, true, true, true])}>all heads on</button>
      </div>

      <div className="mh-grid">
        {HEADS.map((h, i) => <HeadCard key={h.name} head={h} on={enabled[i]} qi={qi} toggle={() => toggle(i)} />)}
      </div>

      <div className="mh-merge">
        <div className="mini-title">Then the heads pool their notes</div>
        <div className="mh-pool">
          {active.length === 0 && <span className="muted small">No heads switched on — the word learns nothing new.</span>}
          {active.map((h) => (
            <div key={h.name} className="mh-seg" style={{ '--c': h.color }}>{h.emoji}</div>
          ))}
          <span className="op">→ glue &amp; mix →</span>
          <div className="mh-final">“{WORDS[qi]}”<br /><span>now enriched</span></div>
        </div>
        <div className="mh-clues">
          {clues.length === 0 ? (
            <span className="muted">“{WORDS[qi]}” gathered no new clues.</span>
          ) : (
            <>
              <span>“{WORDS[qi]}” now knows:</span>
              {clues.map(({ h, top }) => (
                <span key={h.name} className="mh-clue" style={{ '--c': h.color }}>{h.clue}: <b>{WORDS[top]}</b></span>
              ))}
            </>
          )}
        </div>
        <p className="muted small">
          Clues found: <b>{clues.length}</b>. Try switching heads off: with just one head, “licked” would know who did it but not what was licked.
          That is why Transformers use many heads instead of one.
        </p>
      </div>
    </div>
  )
}

export default function MultiHead() {
  const mha = multiHeadAttention(X0, 2, 3)

  return (
    <Section
      id="multihead"
      num="05"
      kicker="Step 5 · Many perspectives"
      title="Multi-Head Attention"
      lead="One attention can only follow one kind of clue at a time. So a Transformer runs several attentions side by side. Each one is called a head, and each learns to look for something different."
    >
      <Team />

      <div className="grid-2">
        <Callout type="intuition" title="In plain words">
          Imagine four detectives reading one sentence. Each one hunts for a different clue, then they put all their notes together. Every head does
          the Query / Key / Value steps you just learned, only with its own set of learned numbers.
        </Callout>
        <Callout type="warn" title="Honest note">
          These patterns are hand-written to make the idea clear. Real heads learn their own jobs during training and are rarely this tidy, but
          researchers do find heads that follow the previous word, link verbs to subjects, and more. The original paper used 8 heads.
        </Callout>
      </div>

      <details className="more">
        <summary>For the curious: the matrix version</summary>
        <Tex block>{'\\text{MultiHead}(X)=\\text{Concat}(\\text{head}_1,\\dots,\\text{head}_h)\\,W^{O}'}</Tex>
        <p className="muted small">
          Each head works on a slice of size d_model / h, so many heads cost about the same as one big one. Their outputs are glued side by side,
          then one matrix W<sup>O</sup> mixes them. Example below: 2 heads on a 4-number input (random weights).
        </p>
        <div className="visual-scroll">
          <div className="flow-row">
            <Matrix name="glued heads" data={mha.concat} digits={2} color="#a78bfa" rowLabels={TOKENS} cellWidth={52} />
            <div className="op">×</div>
            <Matrix name="Wᴼ" data={mha.Wo} digits={1} color="#ffc46b" cellWidth={46} />
            <div className="op">=</div>
            <Matrix name="output" data={mha.out} digits={2} color="#7affd0" rowLabels={TOKENS} cellWidth={52} />
          </div>
        </div>
        <p className="muted small">d_model = {D_MODEL}.</p>
      </details>
    </Section>
  )
}
