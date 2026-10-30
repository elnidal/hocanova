import { useEffect, useState } from 'react'
import { loadIndex, loadUnit, loadAllUnits } from '../content.js'
import { buildQuestionIndex, createProgress, recordAnswer } from '../engine'
import { HintCtx } from '../hintContext.js'
import { canSpeak } from '../tts.js'
import { LogoLockup } from '../components/Logo.jsx'
import Splash from '../components/Splash.jsx'
import Lesson from './Lesson.jsx'

// Tahta modu (adres sonuna #tahta): öğretmen istediği ünitenin istediği gününü açar.
// Giriş yok, oturum açılmaz, ilerleme kaydedilmez; cevaplar yalnız sayfa açıkken bellekte tutulur.
export default function Board() {
  const [index, setIndex] = useState(null)
  const [ctx, setCtx] = useState(null) // { qIndex, items }
  const [unitNo, setUnitNo] = useState(1)
  const [unit, setUnit] = useState(null)
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
      })
      setIndex(idx)
    }).catch(() => setError(true))
  }, [])
  useEffect(() => { setUnit(null); loadUnit(unitNo).then(setUnit).catch(() => setError(true)) }, [unitNo])

  const dispatch = a => setState(s =>
    a.type === 'answer' ? { ...s, progress: recordAnswer(s.progress, a.payload) }
      : a.type === 'dayDone' ? { ...s, doneDays: { ...s.doneDays, [a.key]: true } }
        : s)
  const hintValue = { seen: hints, bump: key => setHints(h => ({ ...h, [key]: (h[key] || 0) + 1 })) }

  if (error) return <div className="wrap">İçerik yüklenemedi. <button className="btn" onClick={() => location.reload()}>Yeniden dene</button></div>
  if (!index || !ctx || !unit) return <Splash />

  if (day) {
    const d = unit.days.find(x => x.day === day)
    const hasNext = unit.days.some(x => x.day === day + 1)
    return (
      <HintCtx.Provider value={hintValue}>
        <Lesson key={`${unitNo}-${day}`} day={d} items={ctx.items} qIndex={ctx.qIndex} state={state} dispatch={dispatch}
          onExit={() => setDay(null)} onNext={hasNext ? () => setDay(day + 1) : null} />
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
          {index.units.filter(u => u.dayCount).map(u => (
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
