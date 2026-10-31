import { useState } from 'react'
import { speak } from '../tts.js'
import { pickRepair, weakUnits, REPAIR_MAX_UNITS } from '../lgsMini.js'
import Coach from '../components/Coach.jsx'
import Question from '../components/Question.jsx'
import Run from '../components/Run.jsx'

// Deneme sonrası tamir seti: öğrenci yanlış yaptığı üniteleri seçer (ya da Mini LGS'den gelir); ünite başına 5 soru, anında geri bildirim.
export default function Repair({ index, state, qIndex, items, dispatch, startUnits, onExit }) {
  const avail = index.units.filter(u => u.dayCount)
  const lastMini = (state.miniLgs || []).at(-1)
  const [units, setUnits] = useState(() => startUnits?.length ? startUnits : weakUnits(lastMini?.byUnit))
  const [list, setList] = useState(startUnits?.length ? () => pickRepair(qIndex, startUnits, state.progress) : null)
  const [stats, setStats] = useState({ ok: 0, wrong: [] })
  const [done, setDone] = useState(false)

  if (!list) return (
    <div className="wrap">
      <button className="btn ghost sm" onClick={onExit}>← Geri</button>
      <div className="eyebrow">Tamir seti</div>
      <h1>Denemede nerede kaybettin?</h1>
      <Coach text="Denemenden yanlış ya da boş çıkan üniteleri seç (en fazla 3). Her birinden 5 soru getireceğim; önce daha önce zorlandığın ifadeler gelir." />
      <section className="card">
        <div className="chips">
          {avail.map(u => {
            const on = units.includes(u.unit)
            return <button key={u.unit} className={`pill${on ? ' on' : ''}`} aria-pressed={on} disabled={!on && units.length >= REPAIR_MAX_UNITS}
              onClick={() => setUnits(on ? units.filter(x => x !== u.unit) : [...units, u.unit])}>
              {u.unit} · <span lang="en">{u.title}</span></button>
          })}
        </div>
        {lastMini && <p className="muted small">Son Mini LGS'ne göre önerdiklerim seçili geldi.</p>}
      </section>
      <button className="btn" disabled={!units.length} onClick={() => setList(pickRepair(qIndex, units, state.progress))}>Başla · {units.length * 5} soru</button>
    </div>
  )

  if (done || !list.length) {
    const total = list.length
    const weak = [...new Set(stats.wrong)].map(id => items[id]?.display).filter(Boolean)
    return (
      <div className="wrap">
        <div className="eyebrow">Tamir seti · bitti</div>
        <div className="card result">
          <div className="row"><span className="big">{stats.ok}<small>/{total}</small></span><div><div className="eyebrow">İlk denemede</div><h2>{stats.ok === total ? 'Tamir tamam!' : 'Güzel iş'}</h2></div></div>
        </div>
        <Coach text={weak.length
          ? `${weak.slice(0, 3).join(', ')} hâlâ biraz oynak. Onları tekrar planına koydum; birkaç gün içinde farklı sorularla döneceğim.`
          : 'Hepsini yerine oturttun! Bir sonraki Mini LGS\'de farkı göreceksin.'} />
        <button className="btn" onClick={onExit}>Ana ekran</button>
      </div>
    )
  }

  const total = list.length
  return (
    <Run key="repair" list={list}
      render={(entry, shuffled, last, onAnswer, onNext, i) => (
        <div className="wrap">
          <div className="spread">
            <button className="btn ghost sm" onClick={onExit}>← Geri</button>
            <span className="muted">{i + 1} / {total}</span>
          </div>
          <div className="bar" aria-hidden="true"><i style={{ width: `${(i / total) * 100}%` }} /></div>
          <div className="row"><span className="eyebrow">Tamir · Ünite {entry.unit}</span></div>
          <Question key={entry.q.id} q={shuffled} mode="learn" last={last} items={items} speak={speak} onAnswer={onAnswer} onNext={onNext} />
        </div>
      )}
      onResult={(entry, ok, picked, shuffled) => {
        dispatch({ type: 'answer', payload: { itemId: entry.itemId, qid: entry.q.id, correct: ok, kind: 'review', chosen: ok ? null : shuffled.options[picked], now: Date.now() } })
        setStats(s => ({ ok: s.ok + (ok ? 1 : 0), wrong: ok ? s.wrong : [...s.wrong, entry.itemId] }))
        return null
      }}
      onEnd={() => { dispatch({ type: 'repairDone', units, ok: stats.ok, n: total, now: Date.now() }); setDone(true) }} />
  )
}
