import { useMemo, useState } from 'react'
import { planLesson, pickQuestion, statusOf, dueCountBy, endOfTomorrow } from '../engine'
import { speak } from '../tts.js'
import Coach from '../components/Coach.jsx'
import Question from '../components/Question.jsx'
import RichText from '../components/RichText.jsx'
import Run from '../components/Run.jsx'
import CardView from '../components/CardView.jsx'

const TIP = { hafiza_kancasi: 'Hafıza kancası', tuzak: 'Tuzak', lgs_taktigi: 'LGS taktiği', kelime_ailesi: 'Kelime ailesi', ilginc_bilgi: 'İlginç bilgi', mini_dilbilgisi: 'Mini dilbilgisi' }
const STAGE_LABEL = { card: 'Kart', sezdir: 'Sezdir', kullan: 'Kullan', sina: 'Sına' }
const PHASES_STORY = ['story', 'scene', 'steps', 'review', 'tips']
const PHASES_LIGHT = ['steps', 'review', 'tips'] // hafif mod: hikâye ve sahne yok

export default function Lesson({ day, items, state, dispatch, qIndex, onExit, onNext, softCapped }) {
  const light = day.mode === 'light'
  const PHASES = light ? PHASES_LIGHT : PHASES_STORY
  const STAGE = light ? ['card', 'kullan', 'sina'] : ['sezdir', 'kullan', 'sina']
  const [plan] = useState(() => planLesson(day, state.progress, Date.now()))
  const newSet = useMemo(() => new Set(day.new_items), [day])
  const [phase, setPhase] = useState(light ? 'steps' : 'story')
  const [stats, setStats] = useState({ first: 0, total: 0, wrong: [] })
  // Hap bilgi: ilgili ifadenin son sorusundan hemen sonra gösterilir; bugünün ifadelerine bağlı olmayanlar raporda çıkar.
  const { stepList, leftoverTips } = useMemo(() => {
    const flat = plan.steps.flatMap(s => s.parts.map(k => {
      const step = day.steps.find(x => x.item === s.item)
      return k === 'card' ? { itemId: s.item, role: 'card', card: step.card } : { itemId: s.item, role: k, q: step[k] }
    }))
    const lastIdx = {}
    flat.forEach((e, i) => { lastIdx[e.itemId] = i })
    const placed = [], leftover = []
    ;(day.tips || []).forEach(t => {
      const idxs = (t.refs || []).filter(r => r in lastIdx).map(r => lastIdx[r])
      if (idxs.length) placed.push({ at: Math.max(...idxs), tip: t }); else leftover.push(t)
    })
    placed.sort((a, b) => b.at - a.at) // sondan başa ekle ki indeksler kaymasın
    const out = [...flat]
    placed.forEach(p => out.splice(p.at + 1, 0, { itemId: null, role: 'tip', tip: p.tip }))
    return { stepList: out, leftoverTips: leftover }
  }, [plan, day])
  const reviewList = useMemo(() => [
    ...plan.review.map(q => ({ itemId: q.item, role: 'review', q })),
    ...plan.extraReview.map(id => ({ itemId: id, role: 'review', q: pickQuestion(qIndex, id, state.progress) })).filter(e => e.q),
  ], [plan, qIndex, state.progress])

  const finish = () => {
    dispatch({ type: 'dayDone', key: `u${day.unit}d${day.day}`, first: stats.first, total: stats.total, n: day.new_items.length, now: Date.now() })
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
      render={(entry, shuffled, last, onAnswer, onNext, i) => {
        if (entry.role === 'tip') return (
          <div className="wrap">
            {head(light ? 'Kullan · Sına' : 'Bugünün ifadeleri', 'Hap bilgi')}
            <TipView tip={entry.tip} last={last} onNext={onNext} />
          </div>
        )
        const it = items[entry.itemId]
        if (entry.role === 'card') return (
          <div className="wrap">
            {head(day.title, 'Bugünün ifadeleri')}
            {i === 0 && <Coach text={day.coach.start} />}
            <CardView item={it} card={entry.card} status={statusOf(state.progress, entry.itemId)} last={last} onNext={onNext} />
          </div>
        )
        const ctx = entry.role === 'sezdir' && day.story.find(l => l.id === entry.q.context)
        return (
          <div className="wrap">
            {head(light ? 'Kullan · Sına' : 'Sezdir · Kullan · Sına', 'Bugünün ifadeleri')}
            <div className="spread">
              <span className="stage">{STAGE.map(s => <i key={s} className={s === entry.role ? 'on' : ''}>{STAGE_LABEL[s]}</i>)}</span>
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
          <Coach text={light ? 'Önceki günlerden bazı ifadeleri tekrar edelim.' : 'Türkçe yok: bakalım önceki ifadeler aklında kalmış mı?'} />
          <Question key={entry.q.id} q={shuffled} mode="learn" last={last} items={items} onAnswer={onAnswer} onNext={onNext} />
        </div>
      )}
      onResult={(entry, ok, picked, shuffled) => { record(entry, ok, picked, shuffled); return null }}
      onEnd={finish} />
  )

  const weak = stats.wrong.map(id => items[id]?.display).filter(Boolean)
  const msg = weak.length ? day.coach.end_mixed.replace('{weak}', weak.slice(0, 3).join(', ')) : day.coach.end_good
  const tomorrow = dueCountBy(state.progress, endOfTomorrow(Date.now()))
  return (
    <div className="wrap">
      {head('Bugünün raporu', 'Gün bitti')}
      <section className="card report">
        <div className="eyebrow">Bugün öğrendiklerin</div>
        <ul>
          {day.new_items.map(id => (
            <li key={id}>
              <span><b>{items[id]?.display}</b> <span className="muted">{items[id]?.meaning_tr}</span></span>
              <span className={stats.wrong.includes(id) ? 'hot' : ''}>{stats.wrong.includes(id) ? 'biraz karıştı' : '✓'}</span>
            </li>
          ))}
        </ul>
        <div className="stats">
          <div className="stat"><b>{stats.first}/{stats.total}</b><span>ilk denemede doğru</span></div>
          <div className="stat"><b>{tomorrow}</b><span>yarına kadar tekrar</span></div>
        </div>
      </section>
      {leftoverTips.map((t, i) => <TipView key={i} tip={t} />)}
      <Coach text={msg} />
      {softCapped && <p className="softnote">Bugün çok yeni ifade öğrendin! Beyin dinlenirken öğrendiklerini pekiştirir; yarınki tekrar çok işe yarayacak. İstersen yine de devam edebilirsin.</p>}
      <div className="row">
        <button className="btn ghost" onClick={onExit}>← Ana ekran</button>
        {onNext && <button className="btn" onClick={onNext}>{softCapped ? 'Yine de devam et →' : 'Bir tane daha →'}</button>}
      </div>
    </div>
  )
}

function TipView({ tip, last, onNext }) {
  return (
    <aside className="card tipcard">
      <div className="eyebrow">Hap bilgi · {TIP[tip.type] || tip.type}</div>
      <p>{tip.text}</p>
      {onNext && <div className="nav"><button className="btn" onClick={onNext}>{last ? 'Bitir' : 'Devam'} →</button></div>}
    </aside>
  )
}
