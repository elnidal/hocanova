import { speak } from '../tts.js'

// Hafif mod "kart" adımı: ifade, anlam, örnek cümle (İngilizce + Türkçe) ve varsa tuzak notu. Soru yok.
export default function CardView({ item, card, status, last, onNext }) {
  const say = t => speak(String(t).split('(')[0])
  return (
    <section className="card cardview">
      <div className="spread">
        <span className="eyebrow">Yeni ifade</span>
        <span className={`chip ${status}`}>{{ new: 'yeni', unc: 'kararsız', known: 'biliniyor' }[status]}</span>
      </div>
      <h2>{item.display} <button className="say" aria-label="Dinle" onClick={() => say(item.display)}>🔊</button></h2>
      <p className="meaning">{item.meaning_tr}</p>
      <div className="example">
        <p className="en-line"><em className="en">{card.example_en}</em> <button className="say" aria-label="Cümleyi dinle" onClick={() => say(card.example_en)}>🔊</button></p>
        <p className="muted">{card.example_tr}</p>
      </div>
      {card.note_tr && <div className="explain">💡 {card.note_tr}</div>}
      <div className="nav"><button className="btn" onClick={onNext}>{last ? 'Bitir' : 'Soruya geç'} →</button></div>
    </section>
  )
}
