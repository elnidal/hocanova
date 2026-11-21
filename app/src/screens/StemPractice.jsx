import { useMemo, useState } from 'react'
import { speak } from '../tts.js'
import { STEMS, stemCounts, stemAccuracy, pickStem, stemName } from '../stems.js'
import Coach from '../components/Coach.jsx'
import Question from '../components/Question.jsx'
import Run from '../components/Run.jsx'

const MEBI = 'https://mebi.eba.gov.tr'
const entries = qs => qs.map(q => ({ q, itemId: q.itemId, unit: q.unit }))

// LGS soru tipleri: 14 soru kökü, her birinden kaç soru var, öğrencinin doğru oranı ve tipe göre 6 soruluk alıştırma.
// MEBİ'deki resmî örnek soruları kopyalamaz; öğrenciyi oraya yönlendirir ve aynı tipte kendi sorularımızı çözdürür.
export default function StemPractice({ state, qIndex, items, dispatch, startStem, onExit }) {
  const counts = useMemo(() => stemCounts(qIndex), [qIndex])
  const acc = useMemo(() => stemAccuracy(qIndex, state.progress?.log), [qIndex, state.progress])
  const studied = useMemo(() => [...new Set(Object.keys(state.doneDays || {}).map(k => +(/^u(\d+)d/.exec(k)?.[1] || 0)).filter(Boolean))], [state.doneDays])
  const [stem, setStem] = useState(startStem || null)
  const [list, setList] = useState(() => { if (!startStem) return null; const l = pickStem(qIndex, startStem, studied); return entries(l.length ? l : pickStem(qIndex, startStem)) })
  const [stats, setStats] = useState({ ok: 0, n: 0 })
  const [done, setDone] = useState(false)
  const start = s => { const l = pickStem(qIndex, s, studied); setStem(s); setList(entries(l.length ? l : pickStem(qIndex, s))); setStats({ ok: 0, n: 0 }); setDone(false) }
  const back = () => { setStem(null); setList(null) }

  if (!stem || !list) return (
    <div className="wrap stems">
      <button className="btn ghost sm" onClick={onExit}>← Geri</button>
      <div className="eyebrow">LGS soru tipleri</div>
      <h1>Hangi soru tipinde zorlanıyorsun?</h1>
      <Coach text="LGS İngilizce 10 soru ve hep aynı soru köklerini kullanıyor. Kökü tanıyan öğrenci soruyu yarı yarıya çözmüş olur. Zorlandığın tipten 6 soru çöz." />
      <section className="card mebi">
        <b>MEB'in resmî örnek soruları</b>
        <p className="small">MEB her yıl LGS örnek soru kitapçıklarını MEBİ'de yayımlıyor. Orada gördüğün her İngilizce soru aşağıdaki tiplerden birine girer: tipi bul, buradan aynı tipte alıştırma yap.</p>
        <a className="btn ghost sm" href={MEBI} target="_blank" rel="noopener noreferrer">MEBİ'yi aç ↗</a>
      </section>
      {STEMS.filter(s => counts[s.id]).map(s => {
        const a = acc[s.id]
        return (
          <section className="card stem-row" key={s.id}>
            <div className="spread"><b>{s.name}</b><span className="muted small">{counts[s.id]} soru</span></div>
            <p className="muted small">{s.tr}</p>
            <div className="spread">
              <span className="small">{a?.n >= 3 ? `Senin doğrun %${Math.round((a.ok / a.n) * 100)} (${a.n} soru)` : 'Henüz yeterli cevap yok'}</span>
              <button className="btn ghost sm" onClick={() => start(s.id)}>Çöz →</button>
            </div>
          </section>
        )
      })}
    </div>
  )

  if (done || !list.length) return (
    <div className="wrap finish">
      <div className="finish-head"><div className="eyebrow">Soru tipi</div><h2>{stemName(stem)}</h2></div>
      <section className="card report"><div className="finish-hero"><div><b>{stats.ok}<small>/{list.length}</small></b><span>doğru</span></div></div></section>
      <Coach text={!list.length ? 'Bu tipte henüz çalıştığın ünitelerden soru yok.' : stats.ok === list.length ? 'Hepsi doğru! Bu kökü artık tanıyorsun.' : 'Kökü tanımak pratikle oturur. Yanlış şıkların açıklamalarına göz attıysan bir tur daha çöz.'} />
      <div className="finish-actions">
        <div className="finish-secondary"><button className="btn ghost" onClick={back}>← Soru tipleri</button></div>
        {list.length > 0 && <button className="btn" onClick={() => start(stem)}>Bir tur daha →</button>}
      </div>
    </div>
  )

  return (
    <Run key={`${stem}-${list.map(e => e.q.id).join()}`} list={list}
      render={(entry, shuffled, last, onAnswer, onNext, i) => (
        <div className="wrap">
          <div className="spread"><button className="btn ghost sm" onClick={back}>← Geri</button><span className="muted">{i + 1} / {list.length}</span></div>
          <div className="bar" aria-hidden="true"><i style={{ width: `${(i / list.length) * 100}%` }} /></div>
          <div className="row"><span className="eyebrow">{stemName(stem)}</span></div>
          <Question key={entry.q.id} q={shuffled} mode="learn" last={last} items={items} speak={speak} onAnswer={onAnswer} onNext={onNext} />
        </div>
      )}
      onResult={(entry, ok, picked, shuffled) => {
        dispatch({ type: 'answer', payload: { itemId: entry.itemId, qid: entry.q.id, correct: ok, kind: 'review', chosen: ok ? null : shuffled.options[picked], now: Date.now() } })
        setStats(s => ({ ok: s.ok + (ok ? 1 : 0), n: s.n + 1 }))
        return null
      }}
      onEnd={() => setDone(true)} />
  )
}
