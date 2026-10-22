// Hızlı kart: her ifade için örnek cümle (hedef ifade işaretli) ve çalışma desteleri. Saf fonksiyonlar, testli.
// RichText.jsx'teki plain ile aynı: işaretleri görünen biçime, etiketleri boşluğa çevirir (Node testleri .jsx okuyamadığı için burada).
const plain = (text, items) =>
  String(text ?? '').replace(/\{(U\d+-\d+)(?:\|([^}]*))?\}/g, (_, id, t) => t || items?.[id]?.display || id).replace(/<[^>]+>/g, '')

const clean = t => String(t ?? '').replace(/\s*\n\s*/g, ' / ').trim()

// "vacation / holiday", "Would you like to …?", "sightseeing (go sightseeing / sightseeing tour)" → aranacak biçimler (önce ana biçim, sonra parantez içindekiler)
const variants = display => {
  const d = String(display)
  const main = d.replace(/\([^)]*\)/g, ' ')
  const extra = [...d.matchAll(/\(([^)]*)\)/g)].map(m => m[1]).join('/')
  return [...main.split('/'), ...extra.split('/')]
    .map(s => s.replace(/[…?.!]/g, '').replace(/\s+/g, ' ').trim()).filter(s => s.length > 1)
}

/** Cümleyi hedef ifadenin geçtiği yerden üçe böler: [önce, ifade, sonra]; bulunamazsa ifade boş kalır. */
export function splitAt(sentence, display) {
  const low = sentence.toLowerCase()
  for (const v of variants(display)) {
    const i = low.indexOf(v.toLowerCase())
    if (i >= 0) return [sentence.slice(0, i), sentence.slice(i, i + v.length), sentence.slice(i + v.length)]
  }
  return [sentence, '', '']
}

/** itemId → { parts:[önce, ifade, sonra], tr } : hafif günde kart örneği, yoksa "kullan" sorusunun doğru cevapla doldurulmuş hâli. */
export function buildExamples(units) {
  const items = Object.fromEntries(units.flatMap(u => u.items).map(i => [i.id, i]))
  const out = {}
  for (const u of units) for (const d of u.days || []) for (const s of d.steps || []) {
    if (out[s.item]) continue
    const it = items[s.item]
    const card = s.card?.example_en && { parts: splitAt(clean(s.card.example_en), it?.display || ''), tr: s.card.example_tr || null }
    if (card?.parts[1]) { out[s.item] = card; continue }
    const k = s.kullan
    if (k?.stem && /_{3,}/.test(k.stem)) {
      const stem = clean(plain(k.stem, items))
      const ans = k.options[k.answer ?? 0]
      const [a, b] = stem.split(/_{3,}/)
      out[s.item] = { parts: [a, ans, b ?? ''], tr: null }
    } else if (card) out[s.item] = card // ifade cümlede bulunamadı (çekimli biçim): cümle işaretsiz gösterilir
  }
  return out
}

/** Desteler: 'hard' = zorlandıkların (yanlış yaptığın, henüz kalıcı olmayan), 'learned' = gördüğün ifadeler, tekrarı en yakın olan önce. */
export function flashDeck(p, deck, { limit = 15 } = {}) {
  const all = Object.entries(p.items)
  const ids = deck === 'hard'
    ? all.filter(([, it]) => ((it.wrong || 0) + (it.flashMiss || 0)) > 0 && it.status !== 'known')
      .sort((a, b) => ((b[1].wrong || 0) + (b[1].flashMiss || 0)) - ((a[1].wrong || 0) + (a[1].flashMiss || 0)))
    : all.filter(([, it]) => it.status !== 'new').sort((a, b) => (a[1].due ?? Infinity) - (b[1].due ?? Infinity))
  return ids.slice(0, limit).map(([id]) => id)
}
