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
import InterviewPrep from './sections/InterviewPrep'

const NAV = [
  { id: 'top', num: '✦', label: 'Start' },
  { id: 'overview', num: '00', label: 'Big picture' },
  { id: 'tokenizer', num: '01', label: 'Tokenizer' },
  { id: 'embeddings', num: '02', label: 'Embeddings' },
  { id: 'positional', num: '03', label: 'Positions' },
  { id: 'attention', num: '04', label: 'Q · K · V' },
  { id: 'multihead', num: '05', label: 'Multi-head' },
  { id: 'encoder', num: '06', label: 'Encoder' },
  { id: 'decoder', num: '07', label: 'Decoder' },
  { id: 'generation', num: '08', label: 'Generation' },
  { id: 'recap', num: '09', label: 'Recap' },
  { id: 'interview', num: '10', label: 'Interview prep' },
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
        <InterviewPrep />
      </main>
      <footer className="footer">
        <div className="footer-by">
          Prepared by <b>Arunkumar Ravichandran</b>
        </div>
        <div className="footer-note">Based on “Attention Is All You Need”</div>
      </footer>
    </>
  )
}
