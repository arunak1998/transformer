const LABELS = { intuition: '💡 Intuition', math: '∑ The math', note: 'Note', warn: 'Honest note' }

export default function Callout({ type = 'intuition', title, children }) {
  return (
    <div className={`callout callout-${type}`}>
      <div className="callout-title">{title ?? LABELS[type]}</div>
      <div>{children}</div>
    </div>
  )
}
