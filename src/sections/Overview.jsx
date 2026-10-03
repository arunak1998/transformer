import Section from '../components/Section'
import Callout from '../components/Callout'

// Boxes are listed bottom → top, like the data flows.
const ENCODER = [
  { io: true, title: 'Input words', sub: 'the cat sleeps' },
  { title: 'Tokenizer + Embeddings + Positions', sub: 'words become numbers', to: 'tokenizer' },
  { title: 'Self-Attention', sub: 'words look at each other', to: 'attention', hot: true },
  { title: 'Feed-Forward', sub: 'each word “thinks”', to: 'encoder' },
]

const DECODER = [
  { io: true, title: 'Words written so far', sub: '<bos> le chat' },
  { title: 'Embeddings + Positions', sub: 'same as the encoder', to: 'embeddings' },
  { title: 'Masked Self-Attention', sub: 'look back at what was written', to: 'decoder', hot: true },
  { title: 'Cross-Attention', sub: 'look at the encoder’s notes', to: 'decoder', hot: true },
  { title: 'Feed-Forward', sub: 'think', to: 'decoder' },
  { title: 'Linear + Softmax', sub: 'score every word', to: 'generation' },
  { io: true, out: true, title: 'Next word', sub: 'dort' },
]

function Box({ box }) {
  const Tag = box.to ? 'a' : 'div'
  const cls = `dbox ${box.io ? 'io' : ''} ${box.out ? 'out' : ''} ${box.hot ? 'hot' : ''}`
  return (
    <Tag className={cls} href={box.to ? `#${box.to}` : undefined}>
      <b>{box.title}</b>
      <span>{box.sub}</span>
    </Tag>
  )
}

function Panel({ title, items, accent }) {
  return (
    <div className="dpanel" style={{ '--accent': accent }}>
      {items.map((box) => <Box key={box.title} box={box} />)}
      <div className="dpanel-title">{title}</div>
    </div>
  )
}

// The encoder and decoder are bottom-aligned with equal box heights, so the
// 4th box of each lines up: the encoder's result flows into cross-attention.
function Architecture() {
  return (
    <div className="darch">
      <Panel title="ENCODER  ×N  — understands" items={ENCODER} accent="#5ee0ff" />
      <div className="dconn">
        <div className="dspacer" /><div className="dspacer" /><div className="dspacer" />
        <div className="dconn-arrow"><span>encoder’s notes<br />(Keys &amp; Values)</span></div>
      </div>
      <Panel title="DECODER  ×N  — writes" items={DECODER} accent="#ff7ab8" />
    </div>
  )
}

export default function Overview() {
  return (
    <Section
      id="overview"
      num="00"
      kicker="The big picture"
      title="One sentence in, one sentence out"
      lead="A Transformer is a stack of simple blocks. Its secret is one idea: let every token look at every other token and decide what matters."
    >
      <Architecture />
      <p className="hint">Data flows upward. Click any box to jump to its explanation. Pink-edged boxes are attention.</p>

      <div className="grid-3">
        <div className="card">
          <h4>Encoder</h4>
          <p>Reads the whole input at once and builds a rich, context-aware vector for every token. It <b>understands</b>.</p>
        </div>
        <div className="card">
          <h4>Decoder</h4>
          <p>Writes the output one token at a time, peeking at the encoder’s understanding. It <b>generates</b>.</p>
        </div>
        <div className="card">
          <h4>Attention</h4>
          <p>The mixing step. Each token asks a Query, matches it against every Key, and collects Values. It <b>connects</b>.</p>
        </div>
      </div>

      <Callout type="note" title="Why it beat RNNs">
        Older models read words one after another, so information had to survive a long chain. A Transformer connects any two words in a
        single step, and all positions are computed in parallel on a GPU.
      </Callout>
    </Section>
  )
}
