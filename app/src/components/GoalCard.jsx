import { GOAL_OPTIONS, todayCount } from '../goal.js'

// Günlük soru hedefi: öğrenci/veli seçer ya da öğretmen ödev bağlantısı gönderir.
export default function GoalCard({ goal, daily, onChange }) {
  const done = todayCount(daily, Date.now())
  const pct = Math.min(100, Math.round((done / goal.target) * 100))
  const reached = done >= goal.target
  return (
    <section className="card goal">
      <div className="spread">
        <div><div className="eyebrow">{goal.source === 'teacher' ? 'Öğretmeninin ödevi' : 'Bugünkü hedef'}</div><b>{done} / {goal.target} soru</b></div>
        <span className="muted small">{reached ? 'Tamam 🎉' : `Kalan ${goal.target - done}`}</span>
      </div>
      <div className="bar" aria-hidden="true"><i style={{ width: `${pct}%` }} /></div>
      {goal.note && <p className="muted small">“{goal.note}”</p>}
      <details className="goalpick">
        <summary className="muted small">Hedefi değiştir</summary>
        <div className="chips">
          {GOAL_OPTIONS.map(n => (
            <button key={n} className={`pill${goal.target === n ? ' on' : ''}`} onClick={() => onChange({ target: n, source: 'self', note: null })}>{n}</button>
          ))}
        </div>
      </details>
    </section>
  )
}
