// Words on top and bottom; lines show how much the selected word looks at each word.
// `source`: show one top node with this label instead of repeating the words.
// `lockedFrom`: words from this index on are "not written yet" and cannot be looked at.
export default function AttentionLines({ tokens, weights, selected = 0, color = '#ff7ab8', source, lockedFrom = Infinity }) {
  const W = 520
  const n = tokens.length
  const x = (j) => ((j + 0.5) * W) / n
  const fromX = source ? W / 2 : x(selected)
  const locked = (j) => j >= lockedFrom

  return (
    <svg viewBox={`0 0 ${W} 170`} className="attn-lines">
      {tokens.map((t, j) =>
        locked(j) ? null : (
          <line key={j} x1={fromX} y1={44} x2={x(j)} y2={118} stroke={color} strokeLinecap="round"
            strokeWidth={1 + weights[j] * 14} opacity={0.2 + weights[j] * 0.8} />
        ),
      )}
      {source ? (
        <g>
          <rect x={W / 2 - 70} y={8} width="140" height="36" rx="10" className="node on" />
          <text x={W / 2} y={31} textAnchor="middle">{source}</text>
        </g>
      ) : (
        tokens.map((t, j) => (
          <g key={'top' + j}>
            <rect x={x(j) - 40} y={8} width="80" height="36" rx="10" className={`node ${j === selected ? 'on' : ''}`} />
            <text x={x(j)} y={31} textAnchor="middle">{t}</text>
          </g>
        ))
      )}
      {tokens.map((t, j) => (
        <g key={t + j} opacity={locked(j) ? 0.45 : 1}>
          <rect x={x(j) - 40} y={118} width="80" height="36" rx="10" className={`node ${locked(j) ? 'locked' : ''}`} />
          <text x={x(j)} y={141} textAnchor="middle">{locked(j) ? '?' : t}</text>
          <text x={x(j)} y={168} textAnchor="middle" className="pct" fill={locked(j) ? '#ff8b8b' : color}>
            {locked(j) ? '✕ not yet' : `${Math.round(weights[j] * 100)}%`}
          </text>
        </g>
      ))}
    </svg>
  )
}
