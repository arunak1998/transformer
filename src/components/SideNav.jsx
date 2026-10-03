import { useEffect, useState } from 'react'

const RING = 2 * Math.PI * 15 // circumference of the progress ring

// Where the reader is: which section is active and how far through it they are.
const readPosition = (items) => {
  const line = window.innerHeight * 0.4
  let index = 0
  items.forEach(({ id }, i) => {
    const el = document.getElementById(id)
    if (el && el.getBoundingClientRect().top < line) index = i
  })
  const el = document.getElementById(items[index].id)
  const rect = el ? el.getBoundingClientRect() : { top: 0, height: 1 }
  const within = Math.min(1, Math.max(0, (line - rect.top) / rect.height))
  return { index, within }
}

function Ring({ progress }) {
  return (
    <svg className="rail-ring" viewBox="0 0 36 36">
      <circle cx="18" cy="18" r="15" className="rail-ring-bg" />
      <circle cx="18" cy="18" r="15" className="rail-ring-fg" strokeDasharray={RING} strokeDashoffset={RING * (1 - progress)} />
    </svg>
  )
}

// Fixed chapter rail (desktop) + floating chapter pill (phone), plus the top progress bar.
export default function SideNav({ items }) {
  const [pos, setPos] = useState({ index: 0, within: 0 })
  const [page, setPage] = useState(0)
  const [sheetOpen, setSheetOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setPage(max > 0 ? window.scrollY / max : 0)
      setPos(readPosition(items))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [items])

  const fill = Math.min(1, (pos.index + pos.within) / (items.length - 1))
  const active = items[pos.index]
  const state = (i) => (i < pos.index ? 'done' : i === pos.index ? 'active' : 'todo')

  return (
    <>
      <div className="progress" style={{ transform: `scaleX(${page})` }} />

      <nav className="rail" aria-label="Chapters">
        <div className="rail-head">
          <span className="rail-head-label">Chapter</span>
          <b>{active.num}</b>
          <span className="rail-head-pct">{Math.round(page * 100)}%</span>
        </div>
        <div className="rail-list">
          <div className="rail-track"><div className="rail-fill" style={{ height: `${fill * 100}%` }} /></div>
          {items.map((item, i) => (
            <a key={item.id} href={`#${item.id}`} className={`rail-node ${state(i)}`}>
              <span className="rail-label">{item.label}</span>
              <span className="rail-dot">
                {i === pos.index && <Ring progress={pos.within} />}
                <span className="rail-num">{i < pos.index ? '✓' : item.num}</span>
              </span>
            </a>
          ))}
        </div>
      </nav>

      <div className={`chip-nav ${sheetOpen ? 'open' : ''}`}>
        {sheetOpen && (
          <div className="chip-sheet">
            {items.map((item, i) => (
              <a key={item.id} href={`#${item.id}`} className={`chip-row ${state(i)}`} onClick={() => setSheetOpen(false)}>
                <span className="chip-row-num">{i < pos.index ? '✓' : item.num}</span>
                {item.label}
              </a>
            ))}
          </div>
        )}
        <button className="chip-pill" onClick={() => setSheetOpen((o) => !o)} aria-expanded={sheetOpen}>
          <span className="chip-ring"><Ring progress={pos.within} /><span>{active.num}</span></span>
          <span className="chip-label">{active.label}</span>
          <span className="chip-pct">{Math.round(page * 100)}%</span>
          <span className="chip-caret">{sheetOpen ? '▾' : '▴'}</span>
        </button>
      </div>
    </>
  )
}
