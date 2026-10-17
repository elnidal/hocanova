import { useState } from 'react'
import RichText from './RichText.jsx'

// Test kipi: geri bildirim yok; öğrenci seçer, "Sonraki" ile onaylar. q: shuffleOptions çıktısı.
export default function Question({ q, onAnswer, last }) {
  const [picked, setPicked] = useState(null)
  return (
    <div className="card q">
      <p className="prompt"><RichText text={q.prompt} /></p>
      {q.stem && <p className="stem"><RichText text={q.stem} /></p>}
      <div className="opts" role="radiogroup">
        {q.options.map((o, i) => (
          <button key={i} role="radio" aria-checked={picked === i} className={`opt${picked === i ? ' on' : ''}`} onClick={() => setPicked(i)}>
            <RichText text={o} />
          </button>
        ))}
      </div>
      <div className="nav">
        <button className="btn" disabled={picked == null} onClick={() => onAnswer(picked)}>{last ? 'Bitir' : 'Sonraki'} →</button>
      </div>
    </div>
  )
}
