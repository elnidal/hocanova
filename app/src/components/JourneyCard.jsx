import { firstWeek, PLEDGES } from '../journey.js'

// İlk 7 gün yolculuğu: bugünkü işin altında sakin bir kart; sıradaki görev ve 7 adımlık ilerleme.
export default function JourneyCard({ state, now, dispatch, run }) {
  const j = firstWeek(state, now)
  if (!j) return null
  const s = j.next
  return (
    <section className="card journey" aria-label="İlk hafta yolculuğu">
      <div className="spread"><div className="eyebrow">İlk haftan · {j.doneN} / {j.steps.length}</div>{j.pledge && <span className="chip">Sözün: haftada {j.pledge} ders</span>}</div>
      <ol className="journey-dots" aria-hidden="true">{j.steps.map(x => <li key={x.key} className={x.done ? 'done' : x === s ? 'now' : ''} />)}</ol>
      <h3>{s.title}</h3>
      <p className="muted small">{s.note}</p>
      {s.action === 'pledge'
        ? <div className="row">{PLEDGES.map(n => <button key={n} className="btn ghost sm" onClick={() => dispatch({ type: 'pledge', perWeek: n, now: Date.now() })}>Haftada {n} ders</button>)}</div>
        : <button className="btn ghost sm" onClick={() => run(s.action)}>Başla →</button>}
    </section>
  )
}
