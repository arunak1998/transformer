import { fmt } from '../lib/linalg'

const hexToRgb = (hex) => {
  const n = parseInt(hex.slice(1), 16)
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`
}

// A matrix drawn with brackets. Cells are shaded by size ("heat").
// Pass `onChange(row, col, value)` to make the cells editable.
export default function Matrix({
  data,
  name,
  color = '#a78bfa',
  rowLabels,
  colLabels,
  digits = 0,
  heat = true,
  maxValue,
  onChange,
  highlightRow = -1,
  onRowHover,
  cellWidth = 46,
}) {
  const finite = data.flat().filter(Number.isFinite)
  const max = maxValue ?? (Math.max(...finite.map(Math.abs)) || 1)
  const rgb = hexToRgb(color)

  const shade = (v) => {
    if (!heat || !Number.isFinite(v)) return 'transparent'
    return `rgba(${rgb}, ${0.08 + 0.55 * Math.min(1, Math.abs(v) / max)})`
  }

  return (
    <div className="matrix-wrap">
      {name && (
        <div className="matrix-name" style={{ color }}>
          {name}
        </div>
      )}
      <div className="matrix-body">
        {rowLabels && (
          <div className="matrix-rowlabels">
            {colLabels && <div className="matrix-collabel">&nbsp;</div>}
            {rowLabels.map((l, i) => (
              <div key={i} className={`matrix-rowlabel ${i === highlightRow ? 'hl' : ''}`}>
                {l}
              </div>
            ))}
          </div>
        )}
        <div>
          {colLabels && (
            <div className="matrix-collabels" style={{ gridTemplateColumns: `repeat(${data[0].length}, ${cellWidth}px)` }}>
              {colLabels.map((l, j) => (
                <div key={j} className="matrix-collabel">
                  {l}
                </div>
              ))}
            </div>
          )}
          <div className="matrix-bracket">
            <div
              className="matrix-grid"
              style={{ gridTemplateColumns: `repeat(${data[0].length}, ${cellWidth}px)` }}
            >
              {data.map((row, i) =>
                row.map((v, j) => (
                  <div
                    key={`${i}-${j}`}
                    className={`matrix-cell ${i === highlightRow ? 'hl' : ''}`}
                    style={{ background: shade(v) }}
                    onMouseEnter={() => onRowHover?.(i)}
                    onMouseLeave={() => onRowHover?.(-1)}
                  >
                    {onChange ? (
                      <input
                        type="number"
                        step="1"
                        value={v}
                        onChange={(e) => onChange(i, j, e.target.value === '' ? 0 : Number(e.target.value))}
                      />
                    ) : (
                      fmt(v, digits)
                    )}
                  </div>
                )),
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
