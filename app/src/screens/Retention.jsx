import { useState } from 'react'
import { speak } from '../tts.js'
import Coach from '../components/Coach.jsx'
import Question from '../components/Question.jsx'
import Run from '../components/Run.jsx'

const INVITE = { day08: '3 gün oldu! 4 dakikalık mini kontrol: şimdiye kadar öğrendiklerinden aklında ne kaldı?', day15: 'Son kontrol! 10 soru, 4 dakika. Ne kadar kalıcı öğrendiğini birlikte görelim.' }

// Kalıcılık kontrolü: tek denemelik, geri bildirimsiz (ölçüm bozulmasın). Cevaplar motora 'retention' olarak yazılır.
export default function Retention({ section, unit, items, dispatch, onExit }) {
  const list = section.questions.map(q => ({ itemId: q.item, role: 'retention', q }))
  const [ok, setOk] = useState(0)
  const [done, setDone] = useState(false)
  const n = list.length

  const finish = () => { dispatch({ type: 'retentionDone', unit, id: section.id, ok, n, now: Date.now() }); setDone(true) }

  if (done) {
    const good = ok / n >= 0.7
    return (
      <div className="wrap">
        <div className="eyebrow">{section.title} · sonuç</div>
        <div className="card result">
          <div className="row"><span className="big">{ok}<small>/{n}</small></span><div><div className="eyebrow">Hatırlama oranı</div><h2>%{Math.round(100 * ok / n)}</h2></div></div>
          <p className="muted small">Pilot hedefi: %70 ve üstü</p>
        </div>
        <Coach text={good ? 'Kalıcı öğrenmişsin! Ders günündeki doğrular gerçekten akılda kalmış 💪' : 'Bazı ifadeler kaymış; normal. Zorlandıklarını tekrar kuyruğuna aldım, yakında yine göreceğiz.'} />
        <button className="btn" onClick={onExit}>Ana ekran</button>
      </div>
    )
  }

  return (
    <Run key="retention" list={list}
      render={(entry, shuffled, last, onAnswer, onNext, i) => (
        <div className="wrap">
          <div className="spread"><button className="btn ghost sm" onClick={onExit}>← Geri</button><span className="muted">{i + 1} / {n}</span></div>
          <div className="bar" aria-hidden="true"><i style={{ width: `${(i / n) * 100}%` }} /></div>
          {i === 0 && <Coach text={INVITE[section.id]} />}
          <Question key={entry.q.id} q={shuffled} mode="test" allowUnknown last={last} items={items} speak={speak}
            onAnswer={picked => { onAnswer(picked); onNext() }} />
        </div>
      )}
      onResult={(entry, correct, picked, shuffled) => {
        dispatch({ type: 'answer', payload: { itemId: entry.itemId, qid: entry.q.id, correct, kind: 'retention', chosen: correct ? null : (shuffled.options[picked] ?? '(bilmiyorum)'), now: Date.now() } })
        if (correct) setOk(v => v + 1)
        return null
      }}
      onEnd={finish} />
  )
}
