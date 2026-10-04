import Section from '../components/Section'

const JOURNEY = [
  { icon: '✂️', name: 'Tokenize', id: 'tokenizer', text: 'Cut the text into pieces and give each an ID.', demo: ['The', 'cat', 'licked', 'its'] },
  { icon: '🔢', name: 'Embed', id: 'embeddings', text: 'Swap every ID for a list of numbers that holds meaning.', demo: ['cat → [0.9, 0.3, …]'] },
  { icon: '📍', name: 'Position', id: 'positional', text: 'Stamp each word with where it sits in the sentence.', demo: ['1 The', '2 cat', '3 licked', '4 its'] },
  { icon: '🔎', name: 'Attention', id: 'attention', text: 'Each word asks a question and listens to the words that answer it.', demo: ['its → cat 78%'] },
  { icon: '🕵️', name: 'Multi-head', id: 'multihead', text: 'Several heads look for different clues at the same time.', demo: ['who: cat', 'what: paw'] },
  { icon: '🧱', name: 'Encoder', id: 'encoder', text: 'Share information, think, repeat ×N. Words now understand context.', demo: ['its = the cat’s'] },
  { icon: '✍️', name: 'Decoder', id: 'decoder', text: 'Write the answer: look back, check the input, think.', demo: ['le chat …'] },
  { icon: '🎯', name: 'Generate', id: 'generation', text: 'Score every word, pick one, add it, and loop again.', demo: ['paw 72%'] },
]

const TAKEAWAYS = [
  'Text becomes numbers before anything else happens.',
  'Attention is search: Query → match Keys → mix Values.',
  'Many heads catch many kinds of clues.',
  'Text is generated one word at a time, in a loop.',
]

export default function Recap() {
  return (
    <Section
      id="recap"
      num="09"
      kicker="The whole journey"
      title="Putting it all together"
      lead="That’s the whole Transformer. Here is every step on one page. Click any step to jump back to it."
    >
      <div className="journey">
        {JOURNEY.map((s, i) => (
          <a key={s.name} href={`#${s.id}`} className="jstep" style={{ '--i': i }}>
            <div className="jstep-head">
              <span className="jstep-n">{String(i + 1).padStart(2, '0')}</span>
              <span className="jstep-icon">{s.icon}</span>
            </div>
            <div className="jstep-name">{s.name}</div>
            <p>{s.text}</p>
            <div className="jstep-demo">
              {s.demo.map((d) => <code key={d}>{d}</code>)}
            </div>
          </a>
        ))}
      </div>

      <div className="finale">
        <div className="finale-kicker">In one sentence</div>
        <p className="finale-text">
          A Transformer turns words into numbers, lets <span className="grad">every word look at every other word</span> to understand the
          context, and then predicts the next word — <span className="grad">one word at a time</span>.
        </p>

        <div className="takeaways">
          {TAKEAWAYS.map((t) => (
            <div key={t} className="takeaway"><span>✓</span>{t}</div>
          ))}
        </div>

        <div className="finale-cta">
          <a className="btn big" href="#interview">Practice interview questions →</a>
          <a className="btn ghost big" href="#top">↑ Back to the start</a>
        </div>
      </div>
    </Section>
  )
}
