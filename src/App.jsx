import SideNav from './components/SideNav'
import Hero from './sections/Hero'
import Overview from './sections/Overview'
import Tokenizer from './sections/Tokenizer'
import Embeddings from './sections/Embeddings'
import Positional from './sections/Positional'
import SelfAttention from './sections/SelfAttention'
import MultiHead from './sections/MultiHead'
import EncoderBlock from './sections/EncoderBlock'
import Decoder from './sections/Decoder'
import Generation from './sections/Generation'
import Recap from './sections/Recap'

const NAV = [
  { id: 'top', label: 'Start' },
  { id: 'overview', label: 'Big picture' },
  { id: 'tokenizer', label: 'Tokenizer' },
  { id: 'embeddings', label: 'Embeddings' },
  { id: 'positional', label: 'Positions' },
  { id: 'attention', label: 'Q · K · V' },
  { id: 'multihead', label: 'Multi-head' },
  { id: 'encoder', label: 'Encoder' },
  { id: 'decoder', label: 'Decoder' },
  { id: 'generation', label: 'Generation' },
  { id: 'recap', label: 'Recap' },
]

export default function App() {
  return (
    <>
      <SideNav items={NAV} />
      <Hero />
      <main>
        <Overview />
        <Tokenizer />
        <Embeddings />
        <Positional />
        <SelfAttention />
        <MultiHead />
        <EncoderBlock />
        <Decoder />
        <Generation />
        <Recap />
      </main>
      <footer className="footer">
        <span>How Transformers Work</span>
        <span className="muted">Based on “Attention Is All You Need” (Vaswani et al., 2017)</span>
      </footer>
    </>
  )
}
