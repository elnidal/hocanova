// Dinleyerek çözme: sorunun okunacak İngilizce parçaları. Türkçe metin İngilizce sesle okunmaz. Saf fonksiyon, testli.
const TR = /[çğıöşüâîûÇĞİÖŞÜÂÎÛ]|\b(ne|bir|ve|hangi|hangisi|için|nedir|midir)\b/i
const MARK = /\{(U\d+-\d+)(?:\|([^}]*))?\}/g
const flat = (t, items) => String(t ?? '').replace(MARK, (_, id, s) => s || items?.[id]?.display || id).replace(/<\/?u>/g, '')

/** Metinde <en> parçası varsa yalnız onlar; yoksa metin Türkçe değilse tamamı. */
export function englishOf(text, items) {
  const t = flat(text, items)
  const en = [...t.matchAll(/<en>([\s\S]*?)<\/en>/g)].map(m => m[1].trim()).filter(Boolean)
  if (en.length) return en.join(' ')
  const plain = t.replace(/<[^>]+>/g, '').trim()
  return plain && !TR.test(plain) ? plain : ''
}

export function listenParts(q, items) {
  const parts = [englishOf(q.prompt, items), englishOf(q.stem, items)].filter(Boolean)
  const opts = (q.options || []).map((o, i) => [i, englishOf(o, items)]).filter(([, o]) => o)
  if (opts.length === (q.options || []).length) for (const [i, o] of opts) parts.push(`${'ABCDE'[i]}. ${o}`)
  return parts
}
