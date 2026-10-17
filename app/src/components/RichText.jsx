// İçerik işaretleri: {U1-012|görünen} / {U1-012}, <en>…</en> (İngilizce), <u>…</u> (altı çizili)
export default function RichText({ text, items }) {
  const clean = String(text ?? '').replace(/\{(U\d+-\d+)(?:\|([^}]*))?\}/g, (_, id, t) => t || items?.[id]?.display || id)
  const parts = clean.split(/(<en>[\s\S]*?<\/en>|<u>[\s\S]*?<\/u>)/g)
  return parts.map((p, i) =>
    p.startsWith('<en>') ? <em key={i} className="en"><RichText text={p.slice(4, -5)} items={items} /></em>
    : p.startsWith('<u>') ? <u key={i}>{p.slice(3, -4)}</u>
    : p)
}
