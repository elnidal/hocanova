import { useMemo, useState } from 'react'
import { dueItems, pickQuestion, statusOf, nextDueAt, daysUntil } from '../engine'
import { speak } from '../tts.js'
import Coach from '../components/Coach.jsx'
import Question from '../components/Question.jsx'
import Run from '../components/Run.jsx'
import { REVIEW_CAP } from '../engine/schedule.js'
import { sessionWrap, stepCta } from '../sessionCoach.js'

const LABEL = { new: 'yeni', unc: 'kararsız', known: 'biliniyor' }
const LIMIT = REVIEW_CAP

// Bağımsız günlük tekrar: vakti gelmiş kelimeler (tavan LIMIT), her biri için daha önce doğru yapılmamış bir soru.
export default function Review({ state, dispatch, qIndex, items, onExit, nextStep, onContinue }) {
  const [start] = useState(() => {
    const now = Date.now()
    const list = dueItems(state.progress, now, { limit: LIMIT })
      .map(id => ({ itemId: id, role: 'review', q: pickQuestion(qIndex, id, state.progress), before: statusOf(state.progress, id) }))
      .filter(e => e.q)
    return { list, now }
  })
  const [stats, setStats] = useState({ first: 0, wrong: [] })
  const [done, setDone] = useState(false)
  const total = start.list.length

  const finish = () => { dispatch({ type: 'reviewDone', first: stats.first, total, now: Date.now() }); setDone(true) }
  const head = (i) => (
    <div className="spread">
      <button className="btn ghost sm" onClick={onExit}>← Geri</button>
      {i != null && <span className="muted">{i + 1} / {total}</span>}
    </div>
  )

  if (!total) return (
    <div className="wrap">
      {head()}<h2>Bugün tekrar yok</h2>
      <Coach text={nextStep && nextStep.key !== 'review'
        ? `Bugün sorulacak tekrar kalmadı. Sıradaki adım: ${nextStep.title}.`
        : 'Bugün sorulacak tekrar kalmadı.'} />
      <div className="row">
        {nextStep && nextStep.key !== 'review' && <button className="btn" onClick={onContinue}>{stepCta(nextStep)}</button>}
        <button className="btn ghost" onClick={onExit}>Ana ekran</button>
      </div>
    </div>
  )

  if (done) {
    const weak = stats.wrong.map(id => items[id]?.display).filter(Boolean)
    const next = nextDueAt(state.progress, Date.now())
    return (
      <div className="wrap">
        <div className="eyebrow">Günlük tekrar · bitti</div>
        <div className="card result">
          <div className="row"><span className="big">{stats.first}<small>/{total}</small></span><div><div className="eyebrow">İlk denemede</div><h2>{stats.first === total ? 'Hepsi doğru' : 'Bu oturum bitti'}</h2></div></div>
          {next && <p className="muted">Sıradaki tekrar: {daysUntil(next, Date.now()) <= 1 ? 'yarın' : `${daysUntil(next, Date.now())} gün sonra`}.</p>}
        </div>
        <Coach text={sessionWrap({ first: stats.first, total, missed: weak, nextTitle: nextStep?.title }).text} />
        <div className="row">
          {nextStep && <button className="btn" onClick={onContinue}>{stepCta(nextStep)}</button>}
          <button className="btn ghost" onClick={onExit}>Ana ekran</button>
        </div>
      </div>
    )
  }

  return (
    <Run key="review" list={start.list}
      render={(entry, shuffled, last, onAnswer, onNext, i) => {
        const it = items[entry.itemId]
        const now = statusOf(state.progress, entry.itemId)
        return (
          <div className="wrap">
            {head(i)}
            <div className="bar" aria-hidden="true"><i style={{ width: `${(i / total) * 100}%` }} /></div>
            <div className="row"><span className="eyebrow">Günlük tekrar</span><span className={`chip ${entry.before}`}>{{ new: 'yeni', unc: 'kararsız', known: 'biliniyor' }[entry.before]}</span></div>
            <Question key={entry.q.id} q={shuffled} mode="learn" last={last} items={items} speak={speak} onAnswer={onAnswer} onNext={onNext}
              extra={now !== entry.before && <p className="muted small">Durum: {LABEL[entry.before]} → <b>{LABEL[now]}</b></p>} />
          </div>
        )
      }}
      onResult={(entry, ok, picked, shuffled) => {
        dispatch({ type: 'answer', payload: { itemId: entry.itemId, qid: entry.q.id, correct: ok, kind: 'review', chosen: ok ? null : shuffled.options[picked], now: Date.now() } })
        setStats(s => ({ first: s.first + (ok ? 1 : 0), wrong: ok ? s.wrong : [...s.wrong, entry.itemId] }))
        return null
      }}
      onEnd={finish} />
  )
}
