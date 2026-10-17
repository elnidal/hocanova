// İçerik işaretleri: {U1-012|görünen} / {U1-012}, <en>…</en> (İngilizce), <u>…</u> (altı çizili)
const TOKEN = /(\{U\d+-\d+(?:\|[^}]*)?\})/
const MARK = /\{(U\d+-\d+)(?:\|([^}]*))?\}/g

export const plain = (text, items) =>
  String(text ?? '').replace(MARK, (_, id, t) => t || items?.[id]?.display || id).replace(/<[^>]+>/g, '')

function Words({ text, items, newSet, speak }) {
  return text.split(TOKEN).map((p, i) => {
    const m = /^\{(U\d+-\d+)(?:\|([^}]*))?\}$/.exec(p)
    if (!m) return p
    const [, id, shown] = m
    const label = shown || items?.[id]?.display || id
    const cls = `tk${newSet?.has(id) ? ' new' : ''}`
    return speak
      ? <button key={i} className={cls} onClick={() => speak(label)}>{label}</button>
      : <span key={i} className={cls}>{label}</span>
  })
}

export default function RichText({ text, items, newSet, speak, noPlay }) {
  const parts = String(text ?? '').split(/(<en>[\s\S]*?<\/en>|<u>[\s\S]*?<\/u>)/g)
  return parts.map((p, i) => {
    if (p.startsWith('<en>')) {
      const inner = p.slice(4, -5)
      return (
        <span key={i}>
          <em className="en"><RichText text={inner} items={items} newSet={newSet} speak={speak} noPlay /></em>
          {speak && !noPlay && <button className="say" aria-label="Dinle" onClick={() => speak(plain(inner, items))}>🔊</button>}
        </span>
      )
    }
    if (p.startsWith('<u>')) return <u key={i}>{p.slice(3, -4)}</u>
    return <Words key={i} text={p} items={items} newSet={newSet} speak={speak} />
  })
}
