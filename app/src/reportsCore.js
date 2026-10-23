// Sorun bildir: saf kısım (testli).
export const KINDS = { wrong: 'Cevap ya da açıklama yanlış', unclear: 'Anlamadım', other: 'Başka bir sorun' }

export function cleanReport({ qid, itemId, kind, note, screen }) {
  if (!qid || !KINDS[kind]) return null
  return {
    qid: String(qid).slice(0, 64),
    item_id: itemId ? String(itemId).slice(0, 32) : null,
    kind,
    note: String(note || '').replace(/\s+/g, ' ').trim().slice(0, 300) || null,
    screen: screen ? String(screen).slice(0, 32) : null,
  }
}
