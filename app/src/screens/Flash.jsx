import { useEffect, useMemo, useState } from 'react'
import { loadAllUnits } from '../content.js'
import { buildExamples, flashDeck } from '../flash.js'
import { speak } from '../tts.js'
import Splash from '../components/Splash.jsx'
import Coach from '../components/Coach.jsx'

const DECKS = { hard: 'Zorlandıklarım', learned: 'Öğrendiklerim' }
const RATE = [['dont', 'Bilmiyorum', '✗'], ['unsure', 'Emin değilim', '~'], ['know', 'Bildim', '✓']]

// Hızlı kart: cümlede işaretli ifade → anlamını hatırla → çevir → kendini değerlendir. Durumu soru çözerek kazanırsın; kart yalnız sırayı etkiler.
export default function Flash({ index, state, dispatch, startDeck, onExit }) {
  const [units, setUnits] = useState(null)
  useEffect(() => { loadAllUnits(index).then(setUnits) }, [index])
  const [deck, setDeck] = useState(null)
  const [list, setList] = useState([])
  const [i, setI] = useState(0)
  const [open, setOpen] = useState(false)
  const [score, setScore] = useState({ know: 0, unsure: 0, dont: 0 })
  const items = useMemo(() => units && Object.fromEntries(units.flatMap(u => u.items).map(x => [x.id, x])), [units])
  const examples = useMemo(() => units && buildExamples(units), [units])
  const counts = { hard: flashDeck(state.progress, 'hard', { limit: 999 }).length, learned: flashDeck(state.progress, 'learned', { limit: 999 }).length }

  const start = d => { setDeck(d); setList(flashDeck(state.progress, d).filter(id => items[id])); setI(0); setOpen(false); setScore({ know: 0, unsure: 0, dont: 0 }) }
  // Dışarıdan bir desteyle açıldıysa (ör. Yanlış defterim) içerik gelince doğrudan başla
  useEffect(() => { if (units && startDeck) start(startDeck) }, [units]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!units) return <Splash text="Kartlar hazırlanıyor…" />

  if (!deck || !list.length) return (
    <div className="wrap">
      <button className="btn ghost sm" onClick={onExit}>← Geri</button>
      <h1>Hızlı kart</h1>
      <Coach text="Cümledeki işaretli ifadenin anlamını aklından söyle, sonra kartı çevir. Dürüst ol: “Bilmiyorum” dediklerini sana daha erken sorarım." />
      {Object.entries(DECKS).map(([k, label]) => (
        <section className="card slim" key={k}>
          <div><b>{label}</b><div className="muted small">{counts[k] ? `${Math.min(counts[k], 15)} kart${counts[k] > 15 ? ` (toplam ${counts[k]})` : ''}` : k === 'hard' ? 'Şimdilik zorlandığın ifade yok 🎉' : 'Önce birkaç ders yap'}</div></div>
          <button className="btn sm" disabled={!counts[k]} onClick={() => start(k)}>Başla →</button>
        </section>
      ))}
    </div>
  )

  if (i >= list.length) return (
    <div className="wrap">
      <h1>Kartlar bitti 🎉</h1>
      <div className="card stats">
        <div className="stat"><b>{score.know}</b><span>bildim</span></div>
        <div className="stat"><b>{score.unsure}</b><span>emin değilim</span></div>
        <div className="stat"><b>{score.dont}</b><span>bilmiyorum</span></div>
      </div>
      <Coach text={score.dont + score.unsure ? 'Emin olmadıklarını tekrar listene öne aldım. Gerçek sorularla pekiştirince “biliyor” olacaklar.' : 'Hepsini hatırladın, harika! Tekrar sorularında bunu göstereceksin.'} />
      <div className="row">
        <button className="btn ghost" onClick={onExit}>← Ana ekran</button>
        <button className="btn" onClick={() => setDeck(null) || setList([])}>Başka deste</button>
      </div>
    </div>
  )

  const id = list[i], it = items[id], ex = examples[id]
  const rate = r => {
    dispatch({ type: 'flash', itemId: id, rating: r, now: Date.now() })
    setScore(s => ({ ...s, [r]: s[r] + 1 }))
    setOpen(false); setI(i + 1)
  }
  return (
    <div className="wrap">
      <div className="spread"><button className="btn ghost sm" onClick={onExit}>← Çık</button><span className="chip">{DECKS[deck]} · {i + 1}/{list.length}</span></div>
      <div className="bar" aria-hidden="true"><i style={{ width: `${(i / list.length) * 100}%` }} /></div>
      <section className={`card flashcard${open ? ' open' : ''}`} onClick={() => !open && setOpen(true)}>
        <div className="eyebrow">İşaretli ifade ne demek?</div>
        <p className="fc-sentence" lang="en">
          {ex?.parts[1] ? <>{ex.parts[0]}<mark>{ex.parts[1]}</mark>{ex.parts[2]}</> : <mark>{it.display}</mark>}
        </p>
        {!open
          ? <p className="muted small fc-hint">Aklından söyle, sonra kartı çevir 👆</p>
          : <div className="fc-back">
              <div className="spread">
                <b className="fc-word" lang="en">{it.display}</b>
                <button className="say" aria-label="Dinle" onClick={e => { e.stopPropagation(); speak(it.display.split('(')[0]) }}>🔊</button>
              </div>
              <p className="fc-meaning">{it.meaning_tr}</p>
              {ex?.tr && <p className="muted small">{ex.tr}</p>}
              {it.trap_note && <div className="explain">💡 {it.trap_note}</div>}
            </div>}
      </section>
      {!open
        ? <button className="btn" onClick={() => setOpen(true)}>Kartı çevir</button>
        : <div className="rate">{RATE.map(([k, label, icon]) => <button key={k} className={`rate-${k}`} onClick={() => rate(k)}><span aria-hidden="true">{icon}</span>{label}</button>)}</div>}
    </div>
  )
}
