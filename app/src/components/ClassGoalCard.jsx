import { useEffect, useState } from 'react'
import { enabled, ensureSession, fetchClassWeek } from '../supabase.js'
import { classView } from '../classGoal.js'

// Sınıf hedefi: profilde sınıf kodu varsa ve öğretmen bu kodu oluşturduysa görünür; yoksa hiçbir şey çizmez.
export default function ClassGoalCard({ code }) {
  const [cw, setCw] = useState(null)
  useEffect(() => {
    if (!enabled || !code) return setCw(null)
    let live = true
    ensureSession().then(fetchClassWeek).then(d => live && setCw(d)).catch(() => live && setCw(null))
    return () => { live = false }
  }, [code])
  const v = classView(cw)
  if (!v) return null
  return (
    <section className="card classgoal" aria-label="Sınıf hedefi">
      <div className="eyebrow">Bu haftanın sınıf hedefi</div>
      <p className="cg-head">{v.head}</p>
      <div className="pace-bar" aria-hidden="true"><i style={{ width: `${v.pct}%` }} /></div>
      {v.top.length > 0 && <ol className="cg-top">{v.top.map((t, i) => <li key={i}><span>{['🥇', '🥈', '🥉'][i]} {t.nick}</span><b>{t.n}</b></li>)}</ol>}
      <p className="muted small">{v.mine}</p>
    </section>
  )
}
