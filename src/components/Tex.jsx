import katex from 'katex'

// Renders a LaTeX string. `block` centers it as its own line.
export default function Tex({ children, block = false }) {
  const html = katex.renderToString(String(children), {
    displayMode: block,
    throwOnError: false,
    strict: false,
  })
  const Tag = block ? 'div' : 'span'
  return <Tag className={block ? 'tex-block' : 'tex-inline'} dangerouslySetInnerHTML={{ __html: html }} />
}
