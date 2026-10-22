// Hikâyede ifadenin yanında gösterilen kısa Türkçe karşılık: elle yazılmış gloss_tr, yoksa meaning_tr'nin kısaltması.
export function shortGloss(item) {
  if (!item) return ''
  if (item.gloss_tr) return item.gloss_tr
  let m = String(item.meaning_tr || '')
  m = m.split(' / ')[0].replace(/\s*\([^)]*\)/g, '').split(/[;:]/)[0].trim()
  if (m.length > 38) m = m.slice(0, 38).replace(/\s+\S*$/, '') + '…'
  return m
}
