import { useEffect, useState } from 'react'
import { softmaxRow } from '../lib/linalg'
import { ROLE_COLOR } from '../lib/demo'

// Hand-made example with readable TAGS, so the idea is visible.
// In a real model, tags are long lists of learned numbers — but the steps are the same.
const WORDS = ['The', 'cat', 'licked', 'its', 'paw']
const WORD_COLORS = ['#ffc46b', '#ff7ab8', '#5ee0ff', '#b6ff7a', '#a78bfa']

const QUESTION = [
  'Which noun do I belong to?',
  'What am I doing?',
  'Who did it, and to what?',
  'Who owns me?',
  'What is happening to me?',
]
const QUERY_TAGS = [
  ['noun', 'animal'],
  ['action', 'verb'],
  ['living', 'animal', 'thing', 'body part'],
  ['living', 'animal', 'noun'],
  ['action', 'verb'],
]
const KEY_TAGS = [['article'], ['living', 'animal', 'noun'], ['action', 'verb'], ['pronoun', 'owner'], ['thing', 'body part', 'noun']]
const VALUE = [
  { emoji: '·', text: '“the”' },
  { emoji: '🐱', text: 'cat info' },
  { emoji: '👅', text: 'licking' },
  { emoji: '↩️', text: '“its”' },
  { emoji: '🐾', text: 'paw info' },
]
const RESULT_TEXT = [
  '“The” now carries mostly cat information: it knows which noun it belongs to.',
  '“cat” now carries a lot of “licking”: it knows what it is doing.',
  '“licked” now holds both cat and paw: who licked, and what was licked.',
  '“its” is now mostly cat. The model has worked out that “its” means the cat’s. 🎉',
  '“paw” now carries “licking”: it knows it is being licked.',
]

const STEPS = [
  { title: 'Query', color: ROLE_COLOR.q },
  { title: 'Key', color: ROLE_COLOR.k },
  { title: 'Match', color: '#ffc46b' },
  { title: 'Softmax', color: '#ff9d5c' },
  { title: 'Value', color: ROLE_COLOR.v },
]

const pct = (x) => `${Math.round(x * 100)}%`

const caption = (step, word, best) => [
  <>🔎 Every word has a question about the other words: its <b style={{ color: ROLE_COLOR.q }}>Query</b>. “{word}” is searching for the pink tags.</>,
  <>🏷️ Every word also wears tags saying what it is: its <b style={{ color: ROLE_COLOR.k }}>Key</b>. These are what the questions get matched against.</>,
  <>✅ Compare the Query tags with every word’s Key tags and <b>count how many match</b>. More matches = higher score. “{word}” matches best with <b>{best}</b>.</>,
  <>🧮 <b style={{ color: '#ff9d5c' }}>Softmax</b> turns match counts into shares that add up to 100%: first boost each score with e<sup>score</sup> (big scores grow a lot), then divide by the total.</>,
  <>🥤 Every word pours its <b style={{ color: ROLE_COLOR.v }}>Value</b> (its information) into “{word}”’s glass, as much as its share. The glass is the new meaning of “{word}”.</>,
][step]

function Tag({ text, kind, match }) {
  return <span className={`qtag ${kind} ${match ? 'match' : ''}`}>{match && '✓ '}#{text}</span>
}

function Glass({ shares, word }) {
  return (
    <div className="glass-wrap">
      <div className="glass">
        {shares.map((s, j) => (
          <div key={j} className="glass-layer" style={{ height: `${s * 100}%`, background: WORD_COLORS[j] }}>
            {s > 0.09 && <span>{VALUE[j].emoji} {pct(s)}</span>}
          </div>
        ))}
      </div>
      <div className="glass-label">new “{word}”</div>
    </div>
  )
}

export default function QkvStory() {
  const [qi, setQi] = useState(3)
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => {
      setStep((s) => {
        if (s >= 4) {
          setPlaying(false)
          return s
        }
        return s + 1
      })
    }, 3800)
    return () => clearInterval(id)
  }, [playing])

  const query = QUERY_TAGS[qi]
  const matches = KEY_TAGS.map((tags) => tags.filter((t) => query.includes(t)).length)
  const exps = matches.map(Math.exp)
  const total = exps.reduce((a, b) => a + b, 0)
  const shares = softmaxRow(matches)
  const best = WORDS[matches.indexOf(Math.max(...matches))]
  const word = WORDS[qi]

  const goStep = (i) => { setPlaying(false); setStep(i) }

  return (
    <div className="panel main-panel">
      <h4 className="qs-sentence">The sentence: “The cat licked its paw”</h4>
      <div className="focus-row">
        <span className="muted">Pick a word to follow:</span>
        {WORDS.map((w, i) => (
          <button key={w} className={`pill ${i === qi ? 'active' : ''}`} onClick={() => { setQi(i); setPlaying(false) }}>{w}</button>
        ))}
        <span className="muted small">(start with “its”)</span>
      </div>

      <div className="xp-steps">
        {STEPS.map((s, i) => (
          <button key={s.title} className={`xp-step ${i === step ? 'on' : ''} ${i < step ? 'done' : ''}`} style={{ '--c': s.color }} onClick={() => goStep(i)}>
            <span>{i + 1}</span>{s.title}
          </button>
        ))}
        <button className="btn small-btn" onClick={() => { setStep(0); setPlaying(true) }}>▶ Play</button>
      </div>

      <div className="xp-caption" style={{ '--c': STEPS[step].color }}>{caption(step, word, best)}</div>

      {step <= 2 && (
        <div className="qs-bubble">
          <div className="qs-bubble-text">
            <span className="mini-title">“{word}” asks</span>
            <div className="qs-question">“{QUESTION[qi]}”</div>
          </div>
          <div className="qtags">
            <span className="muted small">searching for:</span>
            {query.map((t) => <Tag key={t} text={t} kind="q" />)}
          </div>
        </div>
      )}

      <div className="qs-scroll">
        <div className="qs-grid">
          {WORDS.map((w, j) => (
            <div key={w} className="qs-col">
              <div className={`qs-word ${j === qi ? 'me' : ''}`} style={{ '--c': WORD_COLORS[j] }}>{w}</div>

              {(step === 1 || step === 2) && (
                <div className="qs-card" style={{ '--c': step === 1 ? ROLE_COLOR.k : '#ffc46b' }}>
                  <div className="qs-role">{step === 1 ? 'my tags:' : 'matches:'}</div>
                  <div className="qtags col">
                    {KEY_TAGS[j].map((t) => <Tag key={t} text={t} kind="k" match={step === 2 && query.includes(t)} />)}
                  </div>
                  {step === 2 && (
                    <>
                      <div className="qs-big">{matches[j]}</div>
                      <div className="qs-track"><div style={{ width: `${(matches[j] / Math.max(1, ...matches)) * 100}%` }} /></div>
                    </>
                  )}
                </div>
              )}

              {step === 3 && (
                <div className="qs-card" style={{ '--c': '#ff9d5c' }}>
                  <div className="qs-math mono">{matches[j]} match{matches[j] === 1 ? '' : 'es'}</div>
                  <div className="qs-math mono">boost: e<sup>{matches[j]}</sup> = {exps[j].toFixed(1)}</div>
                  <div className="qs-math mono">÷ total {total.toFixed(1)}</div>
                  <div className="qs-big">{pct(shares[j])}</div>
                  <div className="qs-track"><div style={{ width: pct(shares[j]), background: WORD_COLORS[j] }} /></div>
                </div>
              )}

              {step === 4 && (
                <div className="qs-card" style={{ '--c': ROLE_COLOR.v }}>
                  <div className="qs-value">{VALUE[j].emoji}</div>
                  <div className="qs-role center">gives <b>{VALUE[j].text}</b></div>
                  <div className="qs-big small">× {pct(shares[j])}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {step === 3 && (
        <>
          <div className="xp-stack">
            {shares.map((w, j) => (
              <div key={j} style={{ width: pct(w), background: WORD_COLORS[j] }}>{w > 0.07 && `${WORDS[j]} ${pct(w)}`}</div>
            ))}
          </div>
          <p className="muted small center">All shares add up to 100%. Words with no match still keep a tiny share.</p>
        </>
      )}

      {step === 4 && (
        <div className="xp-result qs-result">
          <Glass shares={shares} word={word} />
          <div>
            <div className="mini-title">the new meaning of “{word}”</div>
            <p className="qs-recipe mono">
              {shares
                .map((s, j) => ({ s, j }))
                .sort((a, b) => b.s - a.s)
                .slice(0, 3)
                .map(({ s, j }) => `${pct(s)} ${VALUE[j].text}`)
                .join('  +  ')}
              {'  + …'}
            </p>
            <p className="qs-final">{RESULT_TEXT[qi]}</p>
          </div>
        </div>
      )}

      <div className="steps-nav qs-nav">
        <button className="btn ghost" disabled={step === 0} onClick={() => goStep(step - 1)}>← Back</button>
        <button className="btn" disabled={step === 4} onClick={() => goStep(step + 1)}>Next step →</button>
      </div>
    </div>
  )
}
