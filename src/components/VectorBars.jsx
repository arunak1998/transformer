// A vector drawn as little bars: up = positive (cyan), down = negative (pink).
export default function VectorBars({ values, limit = 2.5, label }) {
  return (
    <div className="vbars">
      <div className="vbars-chart">
        {values.map((v, i) => {
          const h = Math.min(1, Math.abs(v) / limit) * 34
          return (
            <div key={i} className="vbar-slot">
              <div className="vbar-half up">{v > 0 && <div style={{ height: h, background: 'var(--cyan)' }} />}</div>
              <div className="vbar-half down">{v < 0 && <div style={{ height: h, background: 'var(--pink)' }} />}</div>
            </div>
          )
        })}
      </div>
      <div className="vbars-nums">{values.map((v, i) => <span key={i}>{v.toFixed(1)}</span>)}</div>
      {label && <div className="vbars-label">{label}</div>}
    </div>
  )
}
