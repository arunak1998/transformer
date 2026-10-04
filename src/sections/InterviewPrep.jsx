import { useState } from 'react'
import Section from '../components/Section'
import Tex from '../components/Tex'
import { TOPICS, LEVELS, QUESTIONS, CHEAT_SHEET, TIPS } from '../lib/interviewQuestions'

const ALL = 'All'

function CheatSheet() {
  return (
    <div className="panel">
      <h4>⚡ Formula cheat sheet</h4>
      <p className="muted">Every formula, read left to right as simple steps. Learn the steps first; the formula is just the short way to write them.</p>
      <div className="cheat">
        {CHEAT_SHEET.map((c) => (
          <div key={c.title} className="cheat-card">
            <div className="cheat-title"><span>{c.icon}</span>{c.title}</div>
            <p className="cheat-words">{c.words}</p>
            <div className="cheat-steps">
              {c.steps.map((step, i) => (
                <div key={i} className="cheat-step-wrap">
                  {i > 0 && <span className="cheat-arrow" aria-hidden="true">{"→"}</span>}
                  <div className="cheat-step">
                    <span className="cheat-sym">{step.sym}</span>
                    <span className="cheat-meaning">{step.meaning}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="cheat-formula"><Tex>{c.tex}</Tex></div>
            <div className="cheat-remember"><b>Remember:</b> {c.remember}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function QuestionCard({ item, index, open, onToggle }) {
  return (
    <details id={`iq-${index}`} className={`iq ${open ? 'is-open' : ''}`} open={open} onToggle={(e) => onToggle(e.currentTarget.open)}>
      <summary>
        <span className="iq-n">Q{index + 1}</span>
        <span className="iq-q">{item.q}</span>
        <span className={`iq-level l${item.level}`}>{LEVELS[item.level]}</span>
        <span className="iq-caret" aria-hidden="true">+</span>
      </summary>
      <div className="iq-body">
        <div className="iq-one">
          <span>Say this first</span>
          {item.oneLiner}
        </div>
        <ul>
          {item.points.map((p) => <li key={p}>{p}</li>)}
        </ul>
        <a className="iq-link" href={`#${item.chapter}`}>See it visually in the chapter →</a>
      </div>
    </details>
  )
}

export default function InterviewPrep() {
  const [topic, setTopic] = useState(ALL)
  const [opened, setOpened] = useState(() => new Set())

  const visible = QUESTIONS.map((item, index) => ({ item, index })).filter(({ item }) => topic === ALL || item.topic === topic)
  const countFor = (t) => (t === ALL ? QUESTIONS.length : QUESTIONS.filter((q) => q.topic === t).length)

  const setOpen = (index, isOpen) =>
    setOpened((prev) => {
      if (prev.has(index) === isOpen) return prev
      const next = new Set(prev)
      isOpen ? next.add(index) : next.delete(index)
      return next
    })

  const openAll = () => setOpened(new Set(visible.map((v) => v.index)))
  const closeAll = () => setOpened(new Set())

  const practice = () => {
    const pick = visible[Math.floor(Math.random() * visible.length)].index
    setOpened(new Set([pick]))
    requestAnimationFrame(() => document.getElementById(`iq-${pick}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }))
  }

  return (
    <Section
      id="interview"
      num="10"
      kicker="Bonus · Get interview-ready"
      title="Interview Preparation"
      lead="The questions interviewers ask most often about Transformers, each with a one-line answer to say first and the key points to add. Try answering out loud before you open a card."
    >
      <CheatSheet />

      <div className="panel main-panel">
        <div className="iq-toolbar">
          <div className="iq-filters">
            {[ALL, ...TOPICS].map((t) => (
              <button key={t} className={`pill ${t === topic ? 'active' : ''}`} onClick={() => setTopic(t)}>
                {t} <span className="iq-count">{countFor(t)}</span>
              </button>
            ))}
          </div>
          <div className="iq-actions">
            <button className="btn small-btn" onClick={practice}>🎲 Random question</button>
            <button className="btn ghost small-btn" onClick={openAll}>Open all</button>
            <button className="btn ghost small-btn" onClick={closeAll}>Close all</button>
          </div>
        </div>

        <div className="iq-progress">
          <span>Opened {visible.filter((v) => opened.has(v.index)).length} of {visible.length}</span>
          <div className="iq-progress-track">
            <div style={{ width: `${(visible.filter((v) => opened.has(v.index)).length / visible.length) * 100}%` }} />
          </div>
        </div>

        <div className="iq-list">
          {visible.map(({ item, index }) => (
            <QuestionCard key={index} item={item} index={index} open={opened.has(index)} onToggle={(isOpen) => setOpen(index, isOpen)} />
          ))}
        </div>
      </div>

      <div className="panel">
        <h4>🎯 How to answer well</h4>
        <div className="tips">
          {TIPS.map((t, i) => (
            <div key={t} className="tip"><span>{i + 1}</span>{t}</div>
          ))}
        </div>
      </div>
    </Section>
  )
}
