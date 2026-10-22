import SpeakerIcon from './SpeakerIcon.jsx'
// İçerik işaretleri: {U1-012|görünen} / {U1-012}, <en>…</en> (İngilizce), <u>…</u> (altı çizili)
const TOKEN = /(\{U\d+-\d+(?:\|[^}]*)?\})/
const MARK = /\{(U\d+-\d+)(?:\|([^}]*))?\}/g

export const plain = (text, items) =>
  String(text ?? '').replace(MARK, (_, id, t) => t || items?.[id]?.display || id).replace(/<[^>]+>/g, '')

/** Metindeki ifade kimliklerini (görünme sırasıyla) verir. */
export const markIds = text => [...String(text ?? '').matchAll(MARK)].map(m => m[1])

function Words({ text, items, newSet, speak, onWord, left }) {
  return text.split(TOKEN).map((p, i) => {
    const m = /^\{(U\d+-\d+)(?:\|([^}]*))?\}$/.exec(p)
    if (!m) return p
    const [, id, shown] = m
    const raw = shown || items?.[id]?.display || id
    const label = raw.length > 1 && raw === raw.toUpperCase() && /[A-Z]/.test(raw) ? raw.toLowerCase() : raw // yazar tercihi BÜYÜK harf: küçüğe çevrilir
    const cls = `tk${newSet?.has(id) ? ' new' : ''}`
    const g = left?.[id]
    if (g) delete left[id] // açıklama yalnız ilk geçişte
    const tap = onWord ? () => onWord(id, label) : speak ? () => speak(label) : null
    return (
      <span key={i}>
        {tap ? <button className={cls} onClick={tap}>{label}</button> : <span className={cls}>{label}</span>}
        {g && <span className="gl"> ({g})</span>}
      </span>
    )
  })
}

/**
 * onWord(id, label): ifadeye dokununca çağrılır (anlam kutusu için); yoksa yalnız okunuşu çalar.
 * gloss: { id: 'Türkçe karşılık' } — verilen kimliğin bu metindeki ilk geçişinin yanına küçük açıklama konur.
 */
export default function RichText({ text, items, newSet, speak, noPlay, onWord, gloss, _left }) {
  const left = _left || { ...(gloss || {}) }
  const parts = String(text ?? '').split(/(<en>[\s\S]*?<\/en>|<u>[\s\S]*?<\/u>)/g)
  return parts.map((p, i) => {
    if (p.startsWith('<en>')) {
      const inner = p.slice(4, -5)
      return (
        <span key={i}>
          <em className="en"><RichText text={inner} items={items} newSet={newSet} speak={speak} onWord={onWord} _left={left} noPlay /></em>
          {speak && !noPlay && <button className="say" aria-label="Dinle" onClick={() => speak(plain(inner, items))}><SpeakerIcon /></button>}
        </span>
      )
    }
    if (p.startsWith('<u>')) return <u key={i}>{p.slice(3, -4)}</u>
    return <Words key={i} text={p} items={items} newSet={newSet} speak={speak} onWord={onWord} left={left} />
  })
}
