import HeroDemo from '../components/HeroDemo'

const CHAPTERS = [
  ['01', 'Tokenizer', 'tokenizer'],
  ['02', 'Embeddings', 'embeddings'],
  ['03', 'Positions', 'positional'],
  ['04', 'Attention', 'attention'],
  ['05', 'Multi-head', 'multihead'],
  ['06', 'Encoder', 'encoder'],
  ['07', 'Decoder', 'decoder'],
  ['08', 'Generation', 'generation'],
]

export default function Hero() {
  return (
    <header id="top" className="hero">
      <div className="aurora" aria-hidden="true">
        <span className="orb o1" /><span className="orb o2" /><span className="orb o3" />
      </div>
      <div className="hero-grid-bg" aria-hidden="true" />

      <div className="hero-main">
        <div className="hero-copy">
          <div className="badge">✦ The machine behind ChatGPT, explained visually</div>
          <h1>
            How <span className="grad">Transformers</span>
            <br />
            actually work
          </h1>
          <p className="hero-sub">
            Follow one sentence from raw text to the next word. Watch it get split into tokens, see words <b>pay attention</b> to each
            other, and peek inside the encoder and decoder. Every step is interactive, and no PhD is needed.
          </p>
          <div className="hero-cta">
            <a className="btn big" href="#overview">Start the journey →</a>
            <a className="btn ghost big" href="#attention">Jump to attention</a>
          </div>
          <div className="hero-stats">
            <div><b>8</b><span>chapters</span></div>
            <div><b>15+</b><span>interactive demos</span></div>
            <div><b>1</b><span>sentence to follow</span></div>
          </div>
        </div>

        <div className="hero-visual">
          <HeroDemo />
        </div>
      </div>

      <nav className="chapters" aria-label="Chapters">
        {CHAPTERS.map(([n, label, id]) => (
          <a key={id} href={`#${id}`}><span>{n}</span>{label}</a>
        ))}
      </nav>
    </header>
  )
}
