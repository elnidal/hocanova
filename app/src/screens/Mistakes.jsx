import { useMemo, useState } from 'react'
import { mistakeList } from '../mistakes.js'
import Coach from '../components/Coach.jsx'
import RichText from '../components/RichText.jsx'

// Yanlış defterim: yanlış yapılan sorular, verdiğin cevap, doğrusu ve kısa açıklama. Sınav öncesi okumak için.
export default function Mistakes({ state, qIndex, items, onFlash, onExit }) {
  const [showFixed, setShowFixed] = useState(false)
  const byId = useMemo(() => new Map([...qIndex.values()].flat().map(q => [q.id, q])), [qIndex])
  const all = mistakeList(state.progress).filter(m => byId.has(m.qid))
  const open = all.filter(m => !m.fixed)
  const list = (showFixed ? all : open).slice(0, 60)

  return (
    <div className="wrap">
      <button className="btn ghost sm" onClick={onExit}>← Geri</button>
      <h1>Yanlış defterim</h1>
      <Coach text={open.length
        ? `${open.length} soruda henüz takılıyorsun. Doğrusunu ve nedenini oku; sonra kartlarla çalışırsan daha hızlı oturur.`
        : 'Defterin temiz! Yanlış yaptığın her soru burada birikir, düzelttikçe silinir 🎉'} />
      <div className="row">
        {open.length > 0 && <button className="btn" onClick={() => onFlash('hard')}>Bunları kartla çalış →</button>}
        {all.length > open.length && <button className="btn ghost" onClick={() => setShowFixed(v => !v)}>{showFixed ? 'Düzeltilenleri gizle' : `Düzeltilenler (${all.length - open.length})`}</button>}
      </div>
      {list.map(m => {
        const q = byId.get(m.qid), it = items[m.itemId]
        return (
          <section className={`card mistake${m.fixed ? ' fixed' : ''}`} key={m.qid}>
            <div className="spread">
              <span className="chip">{it?.display} · <span className="muted">{it?.meaning_tr}</span></span>
              {m.fixed ? <span className="chip known">düzeldi ✓</span> : m.n > 1 && <span className="chip unc">{m.n} kez</span>}
            </div>
            <p className="prompt"><RichText text={q.prompt} items={items} /></p>
            {q.stem && <p className="stem"><RichText text={q.stem} items={items} /></p>}
            {m.chosen && <p className="small no-line">Senin cevabın: <b>{m.chosen}</b></p>}
            <p className="small ok">Doğrusu: <b>{q.options[q.answer ?? 0]}</b></p>
            {q.explain && <div className="explain">{q.explain}</div>}
          </section>
        )
      })}
    </div>
  )
}
