import { useMemo, useState } from 'react'
import { scorePlacement, shuffleOptions, isCorrect } from '../engine'
import Coach from '../components/Coach.jsx'
import Question from '../components/Question.jsx'

const LEVEL = { baslangic: 'Başlangıç', orta: 'Orta', ileri: 'İleri' }
const SEC = { A: 'kelime tanıma', B: 'bağlamı anlama', C: 'sınavda kullanma' }

export default function Placement({ def, coach, onFinish, onExit }) {
  const list = useMemo(() => def.sections.flatMap(s => s.questions.map(q => ({ ...shuffleOptions(q), sec: s.id, secTitle: s.title }))), [def])
  const [i, setI] = useState(-1) // -1: giriş
  const [correct, setCorrect] = useState({})
  const [result, setResult] = useState(null)

  const answer = picked => {
    const q = list[i]
    const next = { ...correct, [q.id]: isCorrect(q, picked) }
    setCorrect(next)
    if (i + 1 < list.length) return setI(i + 1)
    const r = scorePlacement(def, next)
    setResult(r)
    onFinish(r)
  }

  if (result) return (
    <div className="wrap">
      <div className="eyebrow">Başlangıç testi · sonuç</div>
      <div className="card result">
        <div className="row"><span className="big">{result.tot}<small>/{list.length}</small></span><div><div className="eyebrow">Seviye</div><h2>{LEVEL[result.level]}</h2></div></div>
        <div className="stats">{def.sections.map(s => <div className="stat" key={s.id}><b>{result.score[s.id]}/{s.questions.length}</b><span>{SEC[s.id]}</span></div>)}</div>
      </div>
      <Coach text={`${coach.placement_result[result.level].replace(' {name}', '')} ${def.scoring.coach_focus[result.focus]}`} />
      <button className="btn" onClick={onExit}>Ana ekrana dön</button>
    </div>
  )

  if (i < 0) return (
    <div className="wrap">
      <div className="eyebrow">Başlangıç testi</div>
      <h1>Seni tanıyalım</h1>
      <Coach text="Her soruda tek cevap hakkın var ve doğru/yanlış göstermiyorum. Bilmiyorsan tahmin et; bu bir sınav değil, sadece başlangıç noktan." />
      <div className="row">
        <button className="btn ghost" onClick={onExit}>← Geri</button>
        <button className="btn" onClick={() => setI(0)}>Başla · {list.length} soru</button>
      </div>
    </div>
  )

  const q = list[i]
  return (
    <div className="wrap">
      <div className="spread"><span className="chip">{q.secTitle}</span><span className="muted">{i + 1} / {list.length}</span></div>
      <div className="bar" aria-hidden="true"><i style={{ width: `${(i / list.length) * 100}%` }} /></div>
      <Question key={q.id} q={q} onAnswer={answer} last={i + 1 === list.length} />
    </div>
  )
}
