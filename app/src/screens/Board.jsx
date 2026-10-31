import { useEffect, useState } from 'react'
import { loadIndex, loadAllUnits } from '../content.js'
import { buildQuestionIndex, createProgress, recordAnswer } from '../engine'
import { HintCtx } from '../hintContext.js'
import { canSpeak } from '../tts.js'
import { LogoLockup } from '../components/Logo.jsx'
import Splash from '../components/Splash.jsx'
import Lesson from './Lesson.jsx'

// Tahta modu (adres sonuna #tahta): öğretmen istediği ünitenin istediği gününü açar.
// Ders açıkken üst çubukla gün gün ve üniteden üniteye serbest geçilir (dersi bitirmek gerekmez).
// Giriş yok, oturum açılmaz, ilerleme kaydedilmez; cevaplar yalnız sayfa açıkken bellekte tutulur.
export default function Board() {
  const [index, setIndex] = useState(null)
  const [ctx, setCtx] = useState(null) // { qIndex, items, units }
  const [unitNo, setUnitNo] = useState(1)
  const [day, setDay] = useState(null)
  const [state, setState] = useState(() => ({ progress: createProgress(), doneDays: {} }))
  const [hints, setHints] = useState({})
  const [error, setError] = useState(false)

  useEffect(() => {
    loadIndex().then(async idx => {
      const units = await loadAllUnits(idx)
      setCtx({
        qIndex: buildQuestionIndex({ units, retention: idx.retention, listen: canSpeak }),
        items: Object.fromEntries(units.flatMap(u => u.items).map(i => [i.id, i])),
        units: units.filter(u => u.days?.length),
      })
      setIndex(idx)
    }).catch(() => setError(true))
  }, [])

  const dispatch = a => setState(s =>
    a.type === 'answer' ? { ...s, progress: recordAnswer(s.progress, a.payload) }
      : a.type === 'dayDone' ? { ...s, doneDays: { ...s.doneDays, [a.key]: true } }
        : s)
  const hintValue = { seen: hints, bump: key => setHints(h => ({ ...h, [key]: (h[key] || 0) + 1 })) }

  if (error) return <div className="wrap">İçerik yüklenemedi. <button className="btn" onClick={() => location.reload()}>Yeniden dene</button></div>
  if (!index || !ctx) return <Splash />
  const unit = ctx.units.find(u => u.unit === unitNo) || ctx.units[0]
  // Tüm ünitelerin günleri tek sırada: önceki/sonraki ünite sınırını geçer
  const order = ctx.units.flatMap(u => u.days.map(d => [u.unit, d.day]))
  const pos = order.findIndex(([u, d]) => u === unitNo && d === day)
  const go = k => { const [u, d] = order[k]; setUnitNo(u); setDay(d); scrollTo(0, 0) }

  if (day) {
    const d = unit.days.find(x => x.day === day)
    const prev = pos > 0 ? order[pos - 1] : null, next = pos < order.length - 1 ? order[pos + 1] : null
    return (
      <HintCtx.Provider value={hintValue}>
        <nav className="boardbar" aria-label="Tahta gezintisi">
          <button className="btn ghost sm" disabled={!prev} onClick={() => go(pos - 1)}>← {prev ? (prev[0] !== unitNo ? `Ü${prev[0]} ` : '') + `Gün ${prev[1]}` : 'Önceki'}</button>
          <button className="linkbtn" onClick={() => setDay(null)}>Ünite {unitNo} · Gün {day}</button>
          <button className="btn ghost sm" disabled={!next} onClick={() => go(pos + 1)}>{next ? (next[0] !== unitNo ? `Ünite ${next[0]} · ` : '') + `Gün ${next[1]}` : 'Sonraki'} →</button>
        </nav>
        <Lesson key={`${unitNo}-${day}`} day={d} items={ctx.items} qIndex={ctx.qIndex} state={state} dispatch={dispatch}
          onExit={() => setDay(null)} onNext={next ? () => go(pos + 1) : null} />
      </HintCtx.Provider>
    )
  }

  return (
    <div className="wrap">
      <div className="spread">
        <LogoLockup />
        <span className="chip">Tahta modu · kayıt yok</span>
      </div>
      <section className="card">
        <div className="eyebrow">Ünite seç</div>
        <div className="chips" role="tablist">
          {ctx.units.map(u => (
            <button key={u.unit} role="tab" aria-selected={u.unit === unitNo} className={`pill${u.unit === unitNo ? ' on' : ''}`} onClick={() => setUnitNo(u.unit)}>
              Ünite {u.unit} · <span lang="en">{u.title}</span>
            </button>
          ))}
        </div>
      </section>
      {unit.days.map(d => (
        <section className="card slim" key={d.day}>
          <div>
            <b>Gün {d.day} · {d.title}</b>
            <div className="muted small">{d.est_minutes} dk · {d.new_items.length} yeni ifade{state.doneDays[`u${unit.unit}d${d.day}`] ? ' · ✓ bu oturumda işlendi' : ''}</div>
          </div>
          <button className="btn sm" onClick={() => setDay(d.day)}>Aç →</button>
        </section>
      ))}
    </div>
  )
}
