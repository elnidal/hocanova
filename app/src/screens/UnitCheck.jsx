import { useMemo, useState } from 'react'
import { shuffleOptions, isCorrect, counts } from '../engine'
import Coach from '../components/Coach.jsx'
import Question from '../components/Question.jsx'

// "Biliyor musun?" (evet/hayır, uydurma kelimelerle) → "evet" denenler birer LGS sorusuyla doğrulanır.
export default function UnitCheck({ def, unit, items, qIndex, state, dispatch, onExit }) {
  const yn = def.yes_no
  const words = useMemo(() => {
    const all = [...yn.items.map(id => ({ id, w: items[id].display })), ...yn.pseudowords.map(w => ({ id: null, w }))]
    for (let i = all.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [all[i], all[j]] = [all[j], all[i]] }
    return all
  }, [def, items]) // eslint-disable-line react-hooks/exhaustive-deps
  const [ans, setAns] = useState({}) // index → true/false
  const [phase, setPhase] = useState('ask')
  const [verify, setVerify] = useState({ list: [], i: 0, ok: {} })
  const [result, setResult] = useState(null)

  const fakes = words.filter((x, k) => !x.id && ans[k]).length
  const claimed = words.filter((x, k) => x.id && ans[k]).map(x => x.id)
  const strict = fakes >= yn.pseudoword_threshold

  const finish = ok => {
    const payload = { unit: unit.unit, itemIds: unit.items.map(i => i.id), claimed, verified: ok, fakes, threshold: yn.pseudoword_threshold, now: Date.now() }
    dispatch({ type: 'unitCheck', payload })
    setResult({ fakes, claimed: claimed.length, ok })
    setPhase('result')
  }
  const startVerify = () => {
    const list = claimed.map(id => ({ id, q: shuffleOptions(qIndex.get(id).find(q => q.role === 'sina')) }))
    if (!list.length) return finish({})
    setVerify({ list, i: 0, ok: {} })
    setPhase('verify')
  }

  if (phase === 'ask') {
    const n = Object.keys(ans).length
    return (
      <div className="wrap">
        <div className="spread"><button className="btn ghost sm" onClick={onExit}>← Geri</button><span className="muted">{n}/{words.length}</span></div>
        <div className="eyebrow">Ünite giriş kontrolü</div>
        <h2>{unit.title} · {yn.items.length} ifade</h2>
        <Coach text={yn.prompt} />
        <section className="card">
          {words.map((x, k) => (
            <div className="yn" key={k}>
              <b>{x.w}</b>
              <div className="seg" role="group" aria-label={x.w}>
                <button className={ans[k] === true ? 'on' : ''} onClick={() => setAns(a => ({ ...a, [k]: true }))}>Evet</button>
                <button className={ans[k] === false ? 'on' : ''} onClick={() => setAns(a => ({ ...a, [k]: false }))}>Hayır</button>
              </div>
            </div>
          ))}
        </section>
        <div className="nav"><button className="btn" disabled={n < words.length} onClick={startVerify}>Sonraki →</button></div>
      </div>
    )
  }

  if (phase === 'verify') {
    const { list, i } = verify
    const cur = list[i]
    const next = (ok) => {
      const okMap = { ...verify.ok, [cur.id]: ok }
      if (i + 1 < list.length) setVerify(v => ({ ...v, i: i + 1, ok: okMap }))
      else finish(okMap)
    }
    return (
      <div className="wrap">
        <div className="spread"><span className="chip">Doğrulama</span><span className="muted">{i + 1} / {list.length}</span></div>
        <Coach text={strict ? 'Bazı uydurma kelimelere de "evet" dedin 🙂 O yüzden "evet" dediklerinin hepsini kısaca kontrol ediyorum.' : '"Evet" dediklerini birer LGS sorusuyla kontrol ediyorum.'} />
        <Question key={cur.id} q={cur.q} allowUnknown items={items} last={i + 1 === list.length} onAnswer={picked => next(isCorrect(cur.q, picked))} />
      </div>
    )
  }

  const c = counts(state.progress, unit.items.map(i => i.id))
  return (
    <div className="wrap">
      <div className="eyebrow">Ünite giriş kontrolü · sonuç</div>
      <div className="card">
        <div className="stats">
          <div className="stat"><b>{c.known}</b><span>şimdilik biliyor</span></div>
          <div className="stat"><b>{c.unc}</b><span>kararsız</span></div>
          <div className="stat"><b>{c.new}</b><span>yeni</span></div>
        </div>
        <p className="muted">Bildiğin ifadelerde hikâyeden tahmin adımını atlayacağız ama İngilizce kullanım ve LGS sorusu yine gelecek.{result?.fakes ? ` (Uydurma kelimelere ${result.fakes} kez "evet" dedin.)` : ''}</p>
      </div>
      <button className="btn" onClick={onExit}>Ana ekran</button>
    </div>
  )
}
