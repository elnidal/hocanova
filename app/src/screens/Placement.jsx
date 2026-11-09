import { useMemo, useState } from 'react'
import { scorePlacement, shuffleOptions, isCorrect } from '../engine'
import { placementExpectationLabel } from '../firstUse.js'
import { placementSummary } from '../sessionCoach.js'
import Coach from '../components/Coach.jsx'
import Question from '../components/Question.jsx'
import RichText from '../components/RichText.jsx'

const LEVEL = { baslangic: 'Başlangıç', orta: 'Orta', ileri: 'İleri' }
const SEC = { A: 'kelime tanıma', B: 'bağlamı anlama', C: 'sınavda kullanma' }

export default function Placement({ def, coach, onFinish, onExit, onTour }) {
  const list = useMemo(() => def.sections.flatMap(s => s.questions.map(q => ({ ...shuffleOptions(q), sec: s.id, secTitle: s.title }))), [def])
  const [i, setI] = useState(-1) // -1: giriş
  const [introSeen, setIntroSeen] = useState({})
  const [answers, setAnswers] = useState({}) // soru id → seçilen indeks (-1: bilmiyorum)
  const [result, setResult] = useState(null)

  const answer = picked => {
    const q = list[i]
    const next = { ...answers, [q.id]: picked }
    setAnswers(next)
    if (i + 1 < list.length) return setI(i + 1)
    const correctById = Object.fromEntries(list.map(x => [x.id, isCorrect(x, next[x.id])]))
    const r = scorePlacement(def, correctById)
    setResult(r)
    onFinish(r)
  }

  if (result) {
    const wrong = list.filter(q => !isCorrect(q, answers[q.id]))
    return (
      <div className="wrap">
        <div className="eyebrow">Başlangıç testi · sonuç</div>
        <div className="card result">
          <div className="row"><span className="big">{result.tot}<small>/{list.length}</small></span><div><div className="eyebrow">Seviye</div><h2>{LEVEL[result.level]}</h2></div></div>
          <div className="stats">{def.sections.map(s => <div className="stat" key={s.id}><b>{result.score[s.id]}/{s.questions.length}</b><span>{SEC[s.id]}</span></div>)}</div>
        </div>
        <Coach text={placementSummary(result, def.scoring?.per_section_max)} />
        {wrong.length > 0 && (
          <details className="card review-wrong">
            <summary><b>Yanlışlarını gözden geçir ({wrong.length})</b> <span className="muted small">doğrusu ve kısa açıklama</span></summary>
            {wrong.map(q => (
              <div className="rw" key={q.id}>
                <p className="prompt"><RichText text={q.prompt} /></p>
                {q.stem && <p className="stem"><RichText text={q.stem} /></p>}
                <p className="small">Cevabın: <b>{answers[q.id] === -1 ? 'Bilmiyorum' : q.options[answers[q.id]]}</b></p>
                <p className="small ok">Doğrusu: <b>{q.options[q.correctIndex]}</b></p>
                {q.explain && <div className="explain">{q.explain}</div>}
              </div>
            ))}
          </details>
        )}
        <button className="btn" onClick={onExit}>Bugünkü işi gör</button>
      </div>
    )
  }

  if (i < 0) {
    const expect = placementExpectationLabel(def)
    return (
      <div className="wrap placement-intro">
        <div className="eyebrow">Başlangıç testi</div>
        <h1>Seni tanıyalım</h1>
        {expect && <p className="expect">{expect}. Seviyeni belirler.</p>}
        <Coach text={'Her soruda tek cevap hakkın var ve test sırasında doğru/yanlış göstermiyorum. Bilmiyorsan "Bilmiyorum" de; tahmin etmen gerekmiyor. Bu bir sınav değil, sadece başlangıç noktan. Testten sonra yanlışlarının doğrusunu birlikte göreceğiz.'} />
        <div className="row">
          <button className="btn ghost" onClick={onExit}>← Geri</button>
          <button className="btn" onClick={() => setI(0)}>Başla · {list.length} soru</button>
        </div>
        {onTour && <p className="rolelinks"><button type="button" className="skip" onClick={onTour}>Kısa tanıtımı gör</button></p>}
      </div>
    )
  }

  const q = list[i]
  const sec = def.sections.find(s => s.id === q.sec)
  if (sec.intro && !introSeen[q.sec]) return (
    <div className="wrap">
      <div className="eyebrow">Bölüm {q.sec} · {q.secTitle}</div>
      <Coach text={sec.intro} />
      <div className="nav"><button className="btn" onClick={() => setIntroSeen(s => ({ ...s, [q.sec]: true }))}>Devam →</button></div>
    </div>
  )

  return (
    <div className="wrap">
      <div className="spread"><span className="chip">{q.secTitle}</span><span className="muted">{i + 1} / {list.length}</span></div>
      <div className="bar" aria-hidden="true"><i style={{ width: `${(i / list.length) * 100}%` }} /></div>
      <Question key={q.id} q={q} allowUnknown alwaysHint onAnswer={answer} last={i + 1 === list.length} />
    </div>
  )
}
