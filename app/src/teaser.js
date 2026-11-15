// Merak bitişi: dersin sonunda yarınki dersin ilk sahnesinden kısa bir kesit. Saf fonksiyon, testli.

/** Ertesi gün nesnesinden { kind: 'scene'|'exam', text } ya da null. */
export function teaserFor(next) {
  if (!next) return null
  if (next.exam) return { kind: 'exam', text: `Yarın sınav provası: ${next.title.replace(/^Sınav provası:\s*/i, '')}. Bakalım bu ünite sende ne kadar oturdu?` }
  const durum = next.mini?.find(m => m.durum)?.durum
  if (!durum) return null
  return { kind: 'scene', text: `${durum.trim().replace(/[.!…]+$/, '')}…` }
}
