import { useEffect, useRef } from 'react'

// A page section that fades in when scrolled into view.
export default function Section({ id, num, kicker, title, lead, children }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    const io = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && el.classList.add('in'),
      { threshold: 0.08 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <section id={id} ref={ref} className="section reveal">
      <header className="section-head">
        <div className="section-num">{num}</div>
        <div>
          <div className="kicker">{kicker}</div>
          <h2>{title}</h2>
        </div>
      </header>
      {lead && <p className="lead">{lead}</p>}
      {children}
    </section>
  )
}
