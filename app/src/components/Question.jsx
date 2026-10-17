import { useState } from 'react'
import RichText from './RichText.jsx'

/**
 * q: shuffleOptions çıktısı.
 * mode 'test'  : seçip "Sonraki" ile onaylar; geri bildirim yok (onAnswer onayda çağrılır).
 * mode 'learn' : tıklayınca kilitlenir, doğru/yanlış ve açıklama gösterilir (onAnswer tıklamada), "Sonraki" onNext çağırır.
 */
export default function Question({ q, mode = 'test', onAnswer, onNext, last, extra, items, newSet, speak }) {
  const [picked, setPicked] = useState(null)
  const [locked, setLocked] = useState(false)
  const learn = mode === 'learn'
  const ok = picked === q.correctIndex

  const choose = i => {
    if (locked) return
    setPicked(i)
    if (learn) { setLocked(true); onAnswer(i) }
  }
  const cls = i => {
    if (!learn || !locked) return picked === i ? ' on' : ''
    if (i === q.correctIndex) return ' right'
    return i === picked ? ' wrong' : ''
  }
  const rt = t => <RichText text={t} items={items} newSet={newSet} speak={speak} />

  return (
    <div className="card q">
      <p className="prompt">{rt(q.prompt)}</p>
      {q.stem && <p className="stem">{rt(q.stem)}</p>}
      <div className="opts" role="radiogroup">
        {q.options.map((o, i) => (
          <button key={i} role="radio" aria-checked={picked === i} disabled={locked} className={`opt${cls(i)}`} onClick={() => choose(i)}>
            <RichText text={o} />
          </button>
        ))}
      </div>
      {learn && locked && (
        <div aria-live="polite">
          <p className={`fb ${ok ? 'ok' : 'no'}`}>{ok ? 'Correct!' : 'Not quite. Doğrusu yeşil olan.'}</p>
          {q.explain && <div className="explain">{q.explain}</div>}
          {extra}
        </div>
      )}
      <div className="nav">
        {learn
          ? <button className="btn" disabled={!locked} onClick={onNext}>{last ? 'Bitir' : 'Sonraki'} →</button>
          : <button className="btn" disabled={picked == null} onClick={() => onAnswer(picked)}>{last ? 'Bitir' : 'Sonraki'} →</button>}
      </div>
    </div>
  )
}
