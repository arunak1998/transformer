// Pill-style step picker with back / next buttons.
export default function Steps({ labels, value, onChange }) {
  return (
    <div className="steps">
      <div className="steps-pills">
        {labels.map((l, i) => (
          <button key={l} className={`pill ${i === value ? 'active' : ''} ${i < value ? 'done' : ''}`} onClick={() => onChange(i)}>
            <span className="pill-n">{i + 1}</span>
            {l}
          </button>
        ))}
      </div>
      <div className="steps-nav">
        <button className="btn ghost" disabled={value === 0} onClick={() => onChange(value - 1)}>
          ← Back
        </button>
        <button className="btn" disabled={value === labels.length - 1} onClick={() => onChange(value + 1)}>
          Next step →
        </button>
      </div>
    </div>
  )
}
