import { useMemo, useState } from 'react'
import Section from '../components/Section'
import Callout from '../components/Callout'
import { EXAMPLES, VOCAB, tokenizeText } from '../lib/vocab'

const PALETTE = ['#ff7ab8', '#5ee0ff', '#b6ff7a', '#a78bfa', '#ffc46b', '#7affd0']

// For the "how was it split?" panel: shorten long lists of attempts.
const shorten = (tried) => (tried.length > 4 ? [tried[0], tried[1], '…', tried[tried.length - 1]] : tried)

function WordSplitter({ entry }) {
  return (
    <div className="panel">
      <h4>How “{entry.word}” gets split</h4>
      <p className="muted small">
        The tokenizer takes the longest start of the word that exists in its vocabulary. If none matches, it tries a shorter start.
      </p>
      <div className="split-steps">
        {entry.steps.map((s, i) => (
          <div key={i} className="split-step">
            <div className="split-n">{i + 1}</div>
            <div className="split-tries">
              {shorten(s.tried).map((t, k, arr) => (
                <span key={k} className={`try ${k === arr.length - 1 && s.piece !== '<unk>' ? 'ok' : t === '…' ? 'dots' : 'no'}`}>
                  {t}
                  {t !== '…' && (k === arr.length - 1 && s.piece !== '<unk>' ? ' ✓' : ' ✕')}
                </span>
              ))}
            </div>
            <div className="split-found">→ <b>{s.piece}</b> <span className="muted">(ID {s.id})</span></div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Tokenizer() {
  const [text, setText] = useState(EXAMPLES[0])
  const [picked, setPicked] = useState(0)
  const words = useMemo(() => tokenizeText(text), [text])
  const entry = words[Math.min(picked, words.length - 1)]
  const ids = words.flatMap((w) => w.steps.map((s) => s.id))

  let colorIndex = 0

  return (
    <Section
      id="tokenizer"
      num="01"
      kicker="Step 1 · Text → numbers"
      title="The Tokenizer"
      lead="A computer can only work with numbers. The tokenizer does two simple things: cut the text into small pieces called tokens, then replace each piece with its ID number from a fixed list."
    >
      <div className="panel main-panel">
        <div className="focus-row">
          <span className="muted">Try an example:</span>
          {EXAMPLES.map((e) => (
            <button key={e} className={`pill small ${e === text ? 'active' : ''}`} onClick={() => { setText(e); setPicked(0) }}>{e}</button>
          ))}
        </div>
        <input className="text-input" value={text} onChange={(e) => setText(e.target.value)} spellCheck={false} placeholder="or type your own…" />

        <div className="tk-flow">
          <div className="tk-labels">
            <div>Words</div>
            <div>Tokens</div>
            <div>IDs</div>
          </div>
          <div className="tk-words">
            {words.map((w, wi) => (
              <button key={wi} className={`tk-word ${wi === picked ? 'on' : ''}`} onClick={() => setPicked(wi)} title="Click to see how this word is split">
                <div className="tk-original">{w.word}</div>
                <div className="tk-pieces">
                  {w.steps.map((s, si) => {
                    const c = s.piece === '<unk>' ? '#ff5c5c' : PALETTE[colorIndex++ % PALETTE.length]
                    return (
                      <div key={si} className="tk-piece" style={{ '--c': c }}>
                        <div className="tk-text">{s.piece}</div>
                        <div className="tk-arrow">↓</div>
                        <div className="tk-id">{s.id}</div>
                      </div>
                    )
                  })}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="tk-output">
          <span className="muted small">What the model receives:</span>
          <code>[{ids.join(', ')}]</code>
        </div>
        <p className="muted small">Click a word to see exactly how it was split. Red means “unknown piece”.</p>
      </div>

      {entry && <WordSplitter entry={entry} />}

      <div className="grid-3">
        <div className="card" style={{ '--c': '#ff7ab8' }}>
          <h4>Letters only</h4>
          <p className="muted small">unbelievable</p>
          <div className="mini-tokens">{[...'unbelievable'].map((c, i) => <span key={i}>{c}</span>)}</div>
          <p>12 tokens. Very long, and a single letter says little.</p>
        </div>
        <div className="card" style={{ '--c': '#ffc46b' }}>
          <h4>Whole words only</h4>
          <p className="muted small">unbelievable</p>
          <div className="mini-tokens"><span className="bad">unknown!</span></div>
          <p>Needs a giant list, and any new word breaks it.</p>
        </div>
        <div className="card" style={{ '--c': '#b6ff7a' }}>
          <h4>Pieces ✓</h4>
          <p className="muted small">unbelievable</p>
          <div className="mini-tokens"><span>un</span><span>believ</span><span>able</span></div>
          <p>3 tokens. Small list, and any word can be built.</p>
        </div>
      </div>

      <Callout type="note" title="Real tokenizers">
        This demo has only {VOCAB.length} pieces and lowercases everything. GPT-style models use 50,000–200,000 pieces, learned automatically from
        huge amounts of text (a method called Byte-Pair Encoding). They work the same way: split into known pieces, then look up the IDs.
      </Callout>
    </Section>
  )
}
