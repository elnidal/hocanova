import { useEffect, useMemo, useState } from 'react'
import { planLesson, pickQuestion, statusOf, dueCountBy, endOfTomorrow } from '../engine'
import { speak } from '../tts.js'
import Coach from '../components/Coach.jsx'
import Question from '../components/Question.jsx'
import RichText, { markIds, plain } from '../components/RichText.jsx'
import { shortGloss } from '../gloss.js'
import Run from '../components/Run.jsx'
import CardView from '../components/CardView.jsx'

const TIP = { hafiza_kancasi: 'Hafıza kancası', tuzak: 'Tuzak', lgs_taktigi: 'LGS taktiği', kelime_ailesi: 'Kelime ailesi', ilginc_bilgi: 'İlginç bilgi', mini_dilbilgisi: 'Mini dilbilgisi' }
const STAGE_LABEL = { card: 'Kart', sezdir: 'Sezdir', kullan: 'Kullan', sina: 'Sına' }
const PHASES_STORY = ['story', 'scene', 'steps', 'review', 'tips']
const PHASES_CARDS = ['cards', ...PHASES_STORY]
const PHASES_LIGHT = ['steps', 'review', 'tips'] // hafif mod: hikâye ve sahne yok

export default function Lesson({ day, items, state, dispatch, qIndex, onExit, onNext, softCapped }) {
  const light = day.mode === 'light'
  const [plan] = useState(() => planLesson(day, state.progress, Date.now()))
  const cardFirst = plan.mode === 'cardFirst'
  const advanced = plan.mode === 'advanced'
  const PHASES = light ? PHASES_LIGHT : cardFirst && plan.cardItems.length ? PHASES_CARDS : PHASES_STORY
  const STAGE = light ? ['card', 'kullan', 'sina'] : advanced ? ['sezdir', 'kullan', 'sina'] : ['kullan', 'sina']
  const newSet = useMemo(() => new Set(day.new_items), [day])
  const [phase, setPhase] = useState(light ? 'steps' : cardFirst && plan.cardItems.length ? 'cards' : 'story')
  const [stats, setStats] = useState({ first: 0, total: 0, wrong: [] })
  const [pop, setPop] = useState(null) // dokunulan ifadenin anlam kutusu
  const CHUNK = 4 // hikâye 4'er satır açılır: ekran kalabalık olmasın
  const [shown, setShown] = useState(CHUNK)
  useEffect(() => { if (shown > CHUNK) document.getElementById(`line-${day.story[shown - CHUNK]?.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }, [shown]) // eslint-disable-line react-hooks/exhaustive-deps

  // Hikâyeli günlerde kart: örnek cümle, hikâyenin ilk İngilizce satırından alınır.
  const autoCard = id => {
    for (const l of [...(day.story || []), ...(day.scene || [])]) {
      const seg = (l.text.match(/<en>[\s\S]*?<\/en>/g) || []).find(x => markIds(x).includes(id))
      if (seg) return { example_en: plain(seg.slice(4, -5), items), note_tr: items[id]?.trap_note || null }
    }
    return { example_en: null, note_tr: items[id]?.trap_note || null }
  }
  const cardEntries = useMemo(() => plan.cardItems.map(id => ({ itemId: id, role: 'card', card: autoCard(id) })), [plan]) // eslint-disable-line react-hooks/exhaustive-deps
  // İlk geçişte kısa Türkçe karşılık (ileri seviyede yok: orada anlamı çıkarmaya çalışırlar)
  const glossByLine = useMemo(() => {
    const seen = new Set(), out = {}
    for (const l of [...(day.story || []), ...(day.scene || [])]) {
      const g = {}
      for (const id of markIds(l.text)) if (newSet.has(id) && !seen.has(id)) { seen.add(id); g[id] = shortGloss(items[id]) }
      out[l.id] = advanced ? {} : g
    }
    return out
  }, [day, items, newSet, advanced])
  const onWord = (id, label) => { speak(label); setPop({ label, meaning: items[id]?.meaning_tr }) }
  const popup = pop && (
    <aside className="card wordpop" role="status">
      <span><b>{pop.label}</b> — {pop.meaning}</span>
      <button className="x" aria-label="Kapat" onClick={() => setPop(null)}>✕</button>
    </aside>
  )
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
  const rt = (t, gloss) => <RichText text={t} items={items} newSet={newSet} speak={speak} onWord={onWord} gloss={gloss} />

  const record = (entry, ok, picked, shuffled) => {
    dispatch({ type: 'answer', payload: { itemId: entry.itemId, qid: entry.q.id, correct: ok, kind: entry.role === 'review' ? 'review' : 'lesson', chosen: ok ? null : shuffled.options[picked], now: Date.now() } })
    if (!entry.retry) setStats(s => ({ first: s.first + (ok ? 1 : 0), total: s.total + 1, wrong: ok || s.wrong.includes(entry.itemId) ? s.wrong : [...s.wrong, entry.itemId] }))
  }

  if (phase === 'cards') return (
    <Run key="cards" list={cardEntries}
      render={(entry, _s, last, _a, onNext, i) => (
        <div className="wrap">
          {head('Bugünün ifadeleri', 'Önce öğrenelim')}
          {i === 0 && <Coach text={`Bugün ${cardEntries.length} yeni ifade var. Önce onlara kısaca bakalım, sonra hikâyede nasıl geçtiklerini göreceksin.`} />}
          <CardView item={items[entry.itemId]} card={entry.card} status={statusOf(state.progress, entry.itemId)} last={last} nextLabel={last ? 'Hikâyeye geç' : 'Sonraki'} onNext={onNext} />
        </div>
      )}
      onResult={() => null}
      onEnd={() => setPhase('story')} />
  )

  if (phase === 'story') return (
    <div className="wrap">
      {head(day.title, advanced ? 'Hikâye · sezdir' : 'Hikâyede gör')}
      {!cardFirst && <Coach text={day.coach.start} />}
      <section className="card story">
        <p className="muted small">{advanced
          ? <>Oku. <b className="hot">Kırmızı</b> ifadeler bugün yeni: anlamını hikâyeden çıkarmaya çalış. Dokununca okunuşunu duyarsın.</>
          : <>Hikâyeyi oku. <b className="hot">Kırmızı</b> ifadeler bugün öğrendiklerin; ilk geçtikleri yerde kısa Türkçesi yazıyor, dokununca anlamını ve okunuşunu görürsün.</>}</p>
        {day.story.slice(0, cardFirst || advanced ? shown : day.story.length).map(l => <div id={`line-${l.id}`} key={l.id}><StoryLine text={l.text} rt={t => rt(t, glossByLine[l.id])} /></div>)}
        {shown < day.story.length && <p className="muted small">{shown} / {day.story.length} satır</p>}
      </section>
      <div className="row">
        {cardFirst && <button className="btn ghost" onClick={() => { setPop(null); setPhase('steps') }}>Hikâyeyi atla</button>}
        {shown < day.story.length
          ? <button className="btn" onClick={() => setShown(n => Math.min(n + CHUNK, day.story.length))}>Devam →</button>
          : <button className="btn" onClick={() => { setPop(null); setPhase(day.scene?.length ? 'scene' : 'steps') }}>Sonraki →</button>}
      </div>
      {popup}
    </div>
  )

  if (phase === 'scene') {
    const first = day.scene[0]?.speaker
    return (
      <div className="wrap">
        {head('Mesajlar', 'Sahne · tamamen İngilizce')}
        <section className="card chat">
          {day.scene.map(l => (
            <div key={l.id} className={`msg${l.speaker === first ? '' : ' me'}`}><b>{l.speaker}</b>{rt(l.text, glossByLine[l.id])}</div>
          ))}
        </section>
        <p className="muted">Hepsini anlamaya çalış; bilmediğin kelimeye takılma.</p>
        <div className="nav"><button className="btn" onClick={() => { setPop(null); setPhase('steps') }}>Sonraki →</button></div>
        {popup}
      </div>
    )
  }

  if (phase === 'steps') return (
    <Run key="steps" list={stepList} canRetry
      render={(entry, shuffled, last, onAnswer, onNext, i) => {
        if (entry.role === 'tip') return (
          <div className="wrap">
            {head(advanced ? 'Sezdir · Kullan · Sına' : 'Kullan · Sına', 'Hap bilgi')}
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
            {head(advanced ? 'Sezdir · Kullan · Sına' : 'Kullan · Sına', 'Bugünün ifadeleri')}
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

// Anlatım cümlesi (kim, ne yapıyor) ile İngilizce replik ayrı satırlarda: replik balonu üstündeki anlatımla okunur.
function StoryLine({ text, rt }) {
  const clean = x => x.replace(/^[\s"“”]+|[\s"“”]+$/g, '')
  const SPEECH = /^(.*?[:：])\s*[“"](.+?)[”"]?\s*$/s // "Kim dedi: \"konuşma\"" → anlatım + balon
  const out = []
  text.split(/(<en>[\s\S]*?<\/en>)/g).forEach((p, i) => {
    if (p.startsWith('<en>')) return out.push(<div className="quote" key={i}>{rt(p)}</div>)
    const m = SPEECH.exec(p.trim())
    if (m) { out.push(<p className="nar" key={`${i}n`}>{rt(m[1])}</p>); return out.push(<div className="quote tr" key={`${i}s`}>{rt(m[2])}</div>) }
    if (clean(p)) out.push(<p className="nar" key={i}>{rt(clean(p))}</p>)
  })
  return <div className="storyline">{out}</div>
}
