import { useEffect, useMemo, useRef, useState } from 'react'
import { shuffleOptions, isCorrect, wrongReason } from '../engine'
import { pickMini, scoreMini, fmtNet, miniTrend, MINI_SECS } from '../lgsMini.js'
import { miniResultCopy, stepCta, unitSlip } from '../sessionCoach.js'
import Coach from '../components/Coach.jsx'
import Question from '../components/Question.jsx'
import RichText from '../components/RichText.jsx'

const mmss = s => `${Math.floor(s / 60)}:${String(Math.max(0, s) % 60).padStart(2, '0')}`
const slipLabel = r => [r.y ? `${r.y} yanlış` : '', r.b ? `${r.b} boş` : '', r.thin ? 'az soru' : ''].filter(Boolean).join(' · ')

// Mini LGS: 10 LGS tarzı soru, 15 dk geri sayım, boş bırakma serbest, sonda net ve ünite dökümü.
export default function MiniLgs({ index, state, qIndex, items, dispatch, onExit, nextStep, onContinue }) {
  const avail = index.units.filter(u => u.dayCount)
  const history = state.miniLgs || []
  const trend = miniTrend(history)
  const [units, setUnits] = useState(() => avail.filter(u => u.unit <= state.unit).map(u => u.unit))
  const [list, setList] = useState(null)
  const [i, setI] = useState(0)
  const [answers, setAnswers] = useState({})
  const [t0, setT0] = useState(null)
  const [now, setNow] = useState(Date.now())
  const [result, setResult] = useState(null)
  const done = useRef(false)

  const left = t0 ? MINI_SECS - Math.floor(Math.max(0, now - t0) / 1000) : MINI_SECS
  useEffect(() => { if (!t0 || result) return; const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t) }, [t0, result])

  const finish = (ans, at) => {
    if (done.current) return
    done.current = true
    const r = { ...scoreMini(list, ans), units, qids: list.map(q => q.id), secs: Math.min(MINI_SECS, Math.round((at - t0) / 1000)), now: at }
    setResult(r)
    dispatch({ type: 'miniLgs', result: r })
  }
  useEffect(() => { if (t0 && !result && left <= 0) finish(answers, Date.now()) }) // süre bitti: kalanlar boş

  const start = () => {
    const exclude = new Set(history.slice(-3).flatMap(h => h.qids || []))
    setList(pickMini(qIndex, units, { exclude }).map(q => shuffleOptions(q)))
    setT0(Date.now())
  }

  const answer = picked => {
    const q = list[i], at = Date.now()
    const seen = state.progress.items[q.itemId]
    // Öğrenilmiş ifadeler tekrar planına işlenir; hiç görülmemişler yalnız günlük sayaca (pre test gibi)
    if (seen && seen.status !== 'new' && picked >= 0) dispatch({ type: 'answer', payload: { itemId: q.itemId, qid: q.id, correct: isCorrect(q, picked), kind: 'review', chosen: isCorrect(q, picked) ? null : q.options[picked], now: at } })
    else dispatch({ type: 'examQ', now: at })
    const next = { ...answers, [q.id]: picked }
    setAnswers(next)
    if (i + 1 < list.length) setI(i + 1)
    else finish(next, at)
  }

  const unitTitle = u => avail.find(x => x.unit === +u)?.title || ''

  if (!list) return (
    <div className="wrap">
      <button className="btn ghost sm" onClick={onExit}>← Geri</button>
      <div className="eyebrow">Mini LGS</div>
      <h1>10 soru · 15 dakika</h1>
      <Coach text="Gerçek sınav gibi: geri bildirim sonda, süre işliyor. Emin değilsen boş bırakabilirsin; sonunda netini hesaplayacağım (3 yanlış 1 doğruyu götürür)." />
      {trend && <p className="muted small">Son netin: <b>{fmtNet(trend.last)}</b>{trend.diff != null && ` (${trend.diff >= 0 ? '+' : ''}${fmtNet(trend.diff)})`} · {trend.count} deneme</p>}
      <section className="card">
        <div className="eyebrow">Hangi ünitelerden?</div>
        <p className="muted small">Okulda işlediğin üniteleri seç. MEBİ denemesine hazırlanıyorsan denemenin kapsadığı üniteleri seç.</p>
        <div className="chips">
          {avail.map(u => {
            const on = units.includes(u.unit)
            return <button key={u.unit} className={`pill${on ? ' on' : ''}`} aria-pressed={on}
              onClick={() => setUnits(on ? units.filter(x => x !== u.unit) : [...units, u.unit].sort((a, b) => a - b))}>
              {u.unit} · <span lang="en">{u.title}</span></button>
          })}
        </div>
      </section>
      <button className="btn" disabled={!units.length} onClick={start}>Başla · süre hemen başlar</button>
    </div>
  )

  if (result) {
    const wrong = list.filter(q => answers[q.id] != null && answers[q.id] >= 0 && !isCorrect(q, answers[q.id]))
    const prev = history.length >= 2 ? history[history.length - 2] : null
    const step = nextStep && nextStep.key !== 'mini' ? nextStep : null
    const copy = miniResultCopy({
      d: result.d, n: result.n, byUnit: result.byUnit,
      missed: wrong.map(q => items[q.itemId]?.display?.replace(/[.\s]+$/, '')).filter(Boolean),
      nextTitle: step?.title || null,
    })
    const slips = unitSlip(result.byUnit)
    return (
      <div className="wrap finish">
        <div className="finish-head">
          <div className="eyebrow">Mini LGS</div>
          <h2>Deneme bitti</h2>
        </div>
        <section className="card report">
          <div className="eyebrow">Bu denemenin sayımı</div>
          <div className={`finish-hero${copy.solid ? ' good' : ''}`}>
            <div>
              <b>{fmtNet(result.net)}</b>
              <span>net</span>
            </div>
            <div className="finish-tom">
              <b>{result.d}<small>/{result.n}</small></b>
              <span>doğru</span>
            </div>
          </div>
          <ul>
            {slips.map(r => (
              <li key={r.unit}>
                <span className="rep-word"><b>Ünite {r.unit}</b> <span className="muted" lang="en">{unitTitle(r.unit)}</span></span>
                <span className={r.slipped ? 'miss' : 'hit'}>{r.slipped ? slipLabel(r) : 'hepsi doğru'}</span>
              </li>
            ))}
          </ul>
        </section>
        <p className="muted small">Süre {mmss(result.secs)}.{result.y > 0 ? ` ${result.y} yanlış, ${fmtNet(Math.round(result.y / 3 * 100) / 100)} doğruyu götürdü. İki şıkka indirdiysen işaretle; hiç fikrin yoksa boş bırakmak daha güvenli.` : ''}</p>
        {prev && <p className="muted small">Bir önceki deneme {fmtNet(prev.net)} netti. Bu deneme {fmtNet(result.net)} net.</p>}
        <Coach text={copy.text} />
        {wrong.length > 0 && (
          <details className="card review-wrong">
            <summary><b>Yanlışlarını gözden geçir ({wrong.length})</b> <span className="muted small">doğrusu ve kısa açıklama</span></summary>
            {wrong.map(q => (
              <div className="rw" key={q.id}>
                <p className="prompt"><RichText text={q.prompt} items={items} /></p>
                {q.stem && <p className="stem"><RichText text={q.stem} items={items} /></p>}
                <p className="small">Cevabın: <b>{q.options[answers[q.id]]}</b></p>
                <p className="small ok">Doğrusu: <b>{q.options[q.correctIndex]}</b></p>
                {q.explain && <div className="explain">{q.explain}</div>}
                {wrongReason(q, q.options[answers[q.id]]) && <div className="explain why">🤔 <b>Senin şıkkın neden olmadı:</b> {wrongReason(q, q.options[answers[q.id]])}</div>}
              </div>
            ))}
          </details>
        )}
        <div className="finish-actions">
          {step && <div className="finish-secondary"><button className="btn ghost" onClick={onExit}>← Ana ekran</button></div>}
          <button className="btn" onClick={step ? onContinue : onExit}>{step ? stepCta(step) : 'Ana ekrana dön'}</button>
        </div>
      </div>
    )
  }

  const q = list[i]
  return (
    <div className="wrap">
      <div className="spread">
        <button className="btn ghost sm" onClick={onExit}>← Çık</button>
        <span className={`muted${left <= 120 ? ' hot' : ''}`}>⏱ {mmss(left)} · {i + 1} / {list.length}</span>
      </div>
      <div className="bar" aria-hidden="true"><i style={{ width: `${(i / list.length) * 100}%` }} /></div>
      <Question key={q.id} q={q} items={items} allowUnknown unknownLabel="Boş bırak" onAnswer={answer} last={i + 1 === list.length} />
    </div>
  )
}
