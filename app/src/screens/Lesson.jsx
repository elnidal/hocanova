import { useMemo, useState } from 'react'
import { planLesson, pickQuestion, statusOf } from '../engine'
import { speak } from '../tts.js'
import Coach from '../components/Coach.jsx'
import Question from '../components/Question.jsx'
import RichText from '../components/RichText.jsx'
import Run from '../components/Run.jsx'

const TIP = { hafiza_kancasi: 'Hafıza kancası', tuzak: 'Tuzak', lgs_taktigi: 'LGS taktiği', kelime_ailesi: 'Kelime ailesi', ilginc_bilgi: 'İlginç bilgi', mini_dilbilgisi: 'Mini dilbilgisi' }
const STAGE = ['sezdir', 'kullan', 'sina']
const PHASES = ['story', 'scene', 'steps', 'review', 'tips']

export default function Lesson({ day, items, state, dispatch, qIndex, onExit, onNext }) {
  const [plan] = useState(() => planLesson(day, state.progress, Date.now()))
  const newSet = useMemo(() => new Set(day.new_items), [day])
  const [phase, setPhase] = useState('story')
  const [stats, setStats] = useState({ first: 0, total: 0, wrong: [] })
  const stepList = useMemo(() => plan.steps.flatMap(s => s.parts.map(k => ({ itemId: s.item, role: k, q: day.steps.find(x => x.item === s.item)[k] }))), [plan, day])
  const reviewList = useMemo(() => [
    ...plan.review.map(q => ({ itemId: q.item, role: 'review', q })),
    ...plan.extraReview.map(id => ({ itemId: id, role: 'review', q: pickQuestion(qIndex, id, state.progress) })).filter(e => e.q),
  ], [plan, qIndex, state.progress])

  const finish = () => {
    dispatch({ type: 'dayDone', key: `u${day.unit}d${day.day}`, first: stats.first, total: stats.total, now: Date.now() })
    setPhase('tips')
  }

  const phaseNo = PHASES.indexOf(phase) + 1
  const head = (title, sub) => (
    <div className="spread">
      <button className="btn ghost sm" onClick={onExit}>← Geri</button>
      <span className="chip">Gün {day.day} · {phaseNo}/{PHASES.length}</span>
      <div className="grow"><div className="eyebrow">{sub}</div><h2>{title}</h2></div>
    </div>
  )
  const rt = t => <RichText text={t} items={items} newSet={newSet} speak={speak} />

  const record = (entry, ok, picked, shuffled) => {
    dispatch({ type: 'answer', payload: { itemId: entry.itemId, qid: entry.q.id, correct: ok, kind: entry.role === 'review' ? 'review' : 'lesson', chosen: ok ? null : shuffled.options[picked], now: Date.now() } })
    if (!entry.retry) setStats(s => ({ first: s.first + (ok ? 1 : 0), total: s.total + 1, wrong: ok || s.wrong.includes(entry.itemId) ? s.wrong : [...s.wrong, entry.itemId] }))
  }

  if (phase === 'story') return (
    <div className="wrap">
      {head(day.title, 'Hikâye · sezdir')}
      <Coach text={day.coach.start} />
      <section className="card story">
        <p className="muted small">Oku. <b className="hot">Kırmızı</b> ifadeler bugün yeni: anlamını hikâyeden çıkar. Dokununca okunuşunu duyarsın.</p>
        {day.story.map(l => <p key={l.id}>{rt(l.text)}</p>)}
      </section>
      <div className="nav"><button className="btn" onClick={() => setPhase(day.scene?.length ? 'scene' : 'steps')}>Sonraki →</button></div>
    </div>
  )

  if (phase === 'scene') {
    const first = day.scene[0]?.speaker
    return (
      <div className="wrap">
        {head('Mesajlar', 'Sahne · tamamen İngilizce')}
        <section className="card chat">
          {day.scene.map(l => (
            <div key={l.id} className={`msg${l.speaker === first ? '' : ' me'}`}><b>{l.speaker}</b>{rt(l.text)}</div>
          ))}
        </section>
        <p className="muted">Hepsini anlamaya çalış; bilmediğin kelimeye takılma.</p>
        <div className="nav"><button className="btn" onClick={() => setPhase('steps')}>Sonraki →</button></div>
      </div>
    )
  }

  if (phase === 'steps') return (
    <Run key="steps" list={stepList} canRetry
      render={(entry, shuffled, last, onAnswer, onNext) => {
        const it = items[entry.itemId]
        const ctx = entry.role === 'sezdir' && day.story.find(l => l.id === entry.q.context)
        return (
          <div className="wrap">
            {head('Sezdir · Kullan · Sına', 'Bugünün ifadeleri')}
            <div className="spread">
              <span className="stage">{STAGE.map(s => <i key={s} className={s === entry.role ? 'on' : ''}>{s[0].toUpperCase() + s.slice(1)}</i>)}</span>
              <span className="row">{entry.retry && <span className="chip unc">tekrar</span>}<span className={`chip ${statusOf(state.progress, entry.itemId)}`}>{it.display}</span></span>
            </div>
            {ctx && <div className="ctx">{rt(ctx.text)}</div>}
            <Question key={`${entry.q.id}${entry.retry ? 'r' : ''}`} q={shuffled} mode="learn" last={last} items={items} newSet={newSet} speak={speak}
              onAnswer={onAnswer} onNext={onNext}
              extra={entry.role === 'sezdir' && <div className="explain"><b>{it.display}</b> = {it.meaning_tr} <button className="say" aria-label="Dinle" onClick={() => speak(it.display)}>🔊</button></div>} />
          </div>
        )
      }}
      onResult={(entry, ok, picked, shuffled) => {
        record(entry, ok, picked, shuffled)
        return !ok && !entry.retry && entry.role !== 'sezdir' ? { ...entry, retry: true } : null
      }}
      onEnd={() => (reviewList.length ? setPhase('review') : finish())} />
  )

  if (phase === 'review') return (
    <Run key="review" list={reviewList}
      render={(entry, shuffled, last, onAnswer, onNext) => (
        <div className="wrap">
          {head('Tekrar', 'Önceki günlerden')}
          <Coach text="Türkçe yok: bakalım önceki ifadeler aklında kalmış mı?" />
          <Question key={entry.q.id} q={shuffled} mode="learn" last={last} items={items} onAnswer={onAnswer} onNext={onNext} />
        </div>
      )}
      onResult={(entry, ok, picked, shuffled) => { record(entry, ok, picked, shuffled); return null }}
      onEnd={finish} />
  )

  const weak = stats.wrong.map(id => items[id]?.display).filter(Boolean)
  const msg = weak.length ? day.coach.end_mixed.replace('{weak}', weak.slice(0, 3).join(', ')) : day.coach.end_good
  return (
    <div className="wrap">
      {head('Hap bilgiler', 'Gün bitti')}
      {day.tips.map((t, i) => <aside className="card tip" key={i}><div className="eyebrow">{TIP[t.type] || t.type}</div><p>{t.text}</p></aside>)}
      <Coach text={msg} />
      <p className="muted">{stats.first}/{stats.total} soruyu ilk denemede bildin.</p>
      <div className="row">
        <button className="btn ghost" onClick={onExit}>← Ana ekran</button>
        {onNext && <button className="btn" onClick={onNext}>Gün {day.day + 1} →</button>}
      </div>
    </div>
  )
}
