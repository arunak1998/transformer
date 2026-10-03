// A vector as a row of dots: cyan = positive, pink = negative, bigger = stronger.
export default function Dots({ values, size = 30 }) {
  return (
    <div className="dots">
      {values.map((v, i) => {
        const r = (5 + 10 * Math.min(1, Math.abs(v))) * (size / 30)
        return (
          <span key={i} className="dot-cell" style={{ width: size, height: size }} title={v.toFixed(2)}>
            <i style={{ width: r * 2, height: r * 2, background: v >= 0 ? 'var(--cyan)' : 'var(--pink)', opacity: 0.35 + 0.65 * Math.min(1, Math.abs(v)) }} />
          </span>
        )
      })}
    </div>
  )
}
