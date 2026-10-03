import { useEffect, useState } from 'react'

// Fixed progress bar + dot navigation that tracks the section on screen.
export default function SideNav({ items }) {
  const [active, setActive] = useState(items[0].id)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setProgress(max > 0 ? window.scrollY / max : 0)
      const current = [...items].reverse().find(({ id }) => {
        const el = document.getElementById(id)
        return el && el.getBoundingClientRect().top < window.innerHeight * 0.4
      })
      if (current) setActive(current.id)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [items])

  return (
    <>
      <div className="progress" style={{ transform: `scaleX(${progress})` }} />
      <nav className="sidenav" aria-label="Sections">
        {items.map(({ id, label }) => (
          <a key={id} href={`#${id}`} className={id === active ? 'active' : ''}>
            <span className="dot" />
            <span className="label">{label}</span>
          </a>
        ))}
      </nav>
    </>
  )
}
