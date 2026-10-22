import { GOAL_OPTIONS, todayCount } from '../goal.js'

// Günlük soru hedefi: öğrenci/veli seçer ya da öğretmen ödev bağlantısı gönderir.
export default function GoalCard({ goal, daily, onChange }) {
  const done = todayCount(daily, Date.now())
  const pct = Math.min(100, Math.round((done / goal.target) * 100))
  const reached = done >= goal.target
  return (
    <section className="card goal">
      <div className="eyebrow">{goal.source === 'teacher' ? 'Öğretmeninin ödevi' : 'Bugünkü hedef'}</div>
      <h3>{done} / {goal.target} soru</h3>
      {goal.note && <p className="muted small">“{goal.note}”</p>}
      <div className="bar" aria-hidden="true"><i style={{ width: `${pct}%` }} /></div>
      <p className="muted small">{reached
        ? 'Hedef tamam, harikasın! Fazlası bonus 🎉'
        : `Ders ve tekrar soruları sayılır. Kalan: ${goal.target - done}.`}</p>
      <div className="chips">
        {GOAL_OPTIONS.map(n => (
          <button key={n} className={`pill${goal.target === n ? ' on' : ''}`} onClick={() => onChange({ target: n, source: 'self', note: null })}>{n}</button>
        ))}
      </div>
    </section>
  )
}
