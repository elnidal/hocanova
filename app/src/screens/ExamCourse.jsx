import { useEffect, useMemo, useState } from 'react'
import { loadExamCourse } from '../content.js'
import { examReady, examQuestions, MODULES } from '../exam.js'
import Splash from '../components/Splash.jsx'
import Coach from '../components/Coach.jsx'
import Question from '../components/Question.jsx'
import Run from '../components/Run.jsx'

// Sınav Dili: LGS soru tiplerini ve sınavın kalıp dilini öğreten 24 kısa ders (kartlar → çözümlü örnek → alıştırma → taktik).
export default function ExamCourse({ index, state, dispatch, onExit }) {
  const [course, setCourse] = useState(null)
  const [open, setOpen] = useState(null)
  useEffect(() => { loadExamCourse().then(setCourse) }, [])
  if (!course) return <Splash text="Sınav Dili hazırlanıyor…" />
  if (open) return <ExamLesson lesson={open} state={state} dispatch={dispatch} onExit={() => setOpen(null)} />

  const done = state.examDone || {}
  const next = course.find(l => !done[l.id] && examReady(l.unlock, state.doneDays, index.units))
  return (
    <div className="wrap">
      <button className="btn ghost sm" onClick={onExit}>← Geri</button>
      <h1>Sınav Dili</h1>
      <Coach text="Kelimeyi bilmek yetmez; LGS'nin soru dilini de çözmek gerekir. Her ders 5 dakika: önce taktik, sonra çözümlü örnek, sonra alıştırma." />
      {next && (
        <section className="card today">
          <div className="eyebrow">Sıradaki · {MODULES[next.module]}</div>
          <h2>{next.title}</h2>
          <p className="muted">{next.minutes} dk · {next.practice.length} soru</p>
          <button className="btn" onClick={() => setOpen(next)}>Başla →</button>
        </section>
      )}
      <section className="card">
        <div className="eyebrow">Tüm dersler · {Object.keys(done).length}/{course.length} tamam</div>
        {course.map(l => {
          const d = done[l.id], ready = examReady(l.unlock, state.doneDays, index.units)
          return (
            <button key={l.id} className="exam-row" onClick={() => setOpen(l)}>
              <span className={`exam-dot${d ? ' done' : ready ? ' ready' : ''}`} aria-hidden="true">{d ? '✓' : l.module}</span>
              <span className="grow"><b>{l.title}</b><span className="muted small">{d ? `${d.ok}/${d.n} doğru` : ready ? `${l.minutes} dk · ${l.practice.length} soru` : `${l.unlock?.label.replace(' sonu', '')} ${l.unlock?.day ? 'sonrası' : 'bitince'} önerilir`}</span></span>
              <span aria-hidden="true">›</span>
            </button>
          )
        })}
      </section>
    </div>
  )
}

function ExamLesson({ lesson, dispatch, onExit }) {
  const [phase, setPhase] = useState('cards')
  const [ci, setCi] = useState(0)
  const [ok, setOk] = useState(0)
  const [t0] = useState(Date.now())
  const qs = useMemo(() => examQuestions(lesson), [lesson])
  const head = sub => (
    <div className="spread">
      <button className="btn ghost sm" onClick={onExit}>← Dersler</button>
      <span className="chip">{MODULES[lesson.module]}</span>
      <div className="grow"><div className="eyebrow">{sub}</div><h2>{lesson.title}</h2></div>
    </div>
  )

  if (phase === 'cards') {
    const c = lesson.cards[ci]
    return (
      <div className="wrap">
        {head(`Taktik ${ci + 1}/${lesson.cards.length}`)}
        {ci === 0 && <Coach text={lesson.coach?.start || lesson.intro_tr} />}
        {ci === 0 && lesson.coach?.start && <p className="muted">{lesson.intro_tr}</p>}
        <section className="card">
          <h3>{c.title_tr}</h3>
          <p>{c.body_tr}</p>
          {c.examples_en?.length > 0 && <ul className="exam-ex" lang="en">{c.examples_en.map((x, i) => <li key={i}>{x}</li>)}</ul>}
        </section>
        <div className="nav"><button className="btn" onClick={() => (ci + 1 < lesson.cards.length ? setCi(ci + 1) : setPhase(lesson.worked_example ? 'worked' : 'practice'))}>Devam →</button></div>
      </div>
    )
  }

  if (phase === 'worked') {
    const w = lesson.worked_example
    return (
      <div className="wrap">
        {head('Çözümlü örnek')}
        <section className="card q">
          <p className="prompt">{w.prompt}</p>
          {w.context && <p className="stem">{w.context}</p>}
          <div className="opts">{w.options.map((o, i) => <div key={i} className={`opt${i === (w.answer ?? 0) ? ' right' : ''}`}>{o}</div>)}</div>
          <div className="explain">{w.explain_tr}</div>
        </section>
        <div className="nav"><button className="btn" onClick={() => setPhase('practice')}>Şimdi sen dene →</button></div>
      </div>
    )
  }

  if (phase === 'practice') return (
    <Run key="p" list={qs.map(q => ({ q }))}
      render={(entry, shuffled, last, onAnswer, onNext, i) => (
        <div className="wrap">
          {head(`Alıştırma ${i + 1}/${qs.length}`)}
          <div className="bar" aria-hidden="true"><i style={{ width: `${(i / qs.length) * 100}%` }} /></div>
          <Question key={entry.q.id} q={shuffled} mode="learn" last={last} onAnswer={onAnswer} onNext={onNext} />
        </div>
      )}
      onResult={(entry, right) => { if (right) setOk(n => n + 1); dispatch({ type: 'examQ', now: Date.now() }); return null }}
      onEnd={() => { setPhase('end') }} />
  )

  const mins = Math.max(1, Math.round((Date.now() - t0) / 60000))
  return (
    <div className="wrap">
      {head('Ders bitti')}
      <section className="card stats">
        <div className="stat"><b>{ok}/{qs.length}</b><span>doğru</span></div>
        <div className="stat"><b>{mins} dk</b><span>süre</span></div>
      </section>
      {lesson.tips?.length > 0 && (
        <section className="card tipcard">
          <div className="eyebrow">Sınavda aklında olsun</div>
          <ul>{lesson.tips.map((t, i) => <li key={i}>{t}</li>)}</ul>
        </section>
      )}
      <Coach text={ok / qs.length >= 0.6 ? (lesson.coach?.end || 'Bir sınav refleksi daha kazandın!') : 'Bu soru tipi biraz zorladı, çok normal. Yukarıdaki taktikleri bir kez daha oku; birkaç gün sonra dersi yeniden açıp farkı gör 💪'} />
      <button className="btn" onClick={() => { dispatch({ type: 'examDone', id: lesson.id, ok, n: qs.length, now: Date.now() }); onExit() }}>Derslere dön →</button>
    </div>
  )
}
