// Kelime durumu ve cevap kaydı. Saf fonksiyonlar: durum nesnesi alır, yenisini döndürür.
export const DAY = 864e5
export const MIN_GAP = 18 * 36e5 // "biliniyor" için ilk doğru ile son doğru arası en az ~1 gün

// Tekrar aralıkları (gün). Seviye testinin etkisi: başlangıç kısa, ileri uzun.
export const INTERVALS = {
  baslangic: [1, 2, 4, 7, 14],
  orta: [1, 3, 7, 14, 30],
  ileri: [2, 5, 10, 21, 45],
}
const LESSON_KINDS = new Set(['lesson'])
const LOG_CAP = 3000

export const createProgress = (level = 'orta') => ({ level, items: {}, log: [] })

const blankItem = () => ({
  status: 'new', correct: 0, wrong: 0, streak: 0, streakStart: null,
  goodQs: [], lastQ: null, lastAt: null, box: 0, due: null, source: null, conf: {},
})

export const getItem = (p, id) => p.items[id] || blankItem()
export const statusOf = (p, id) => getItem(p, id).status

export const intervalDays = (p, box) => {
  const list = INTERVALS[p.level] || INTERVALS.orta
  return list[Math.min(box, list.length - 1)]
}

export function setLevel(p, level) {
  if (!INTERVALS[level]) throw new Error(`bilinmeyen seviye: ${level}`)
  return { ...p, level }
}

/**
 * Bir cevabı işler.
 * kind: 'lesson' (ders günü) | 'review' | 'retention' | 'check' (ünite girişi doğrulama)
 * Kurallar:
 *  - doğru ders cevabı: new → unc; kutu sıfırda kalır, ertesi gün tekrar.
 *  - ders dışı (review/retention/check) doğru cevap kutuyu bir artırır, aralık uzar.
 *  - "known": en az 2 farklı soruda doğru + seri başladığından beri ≥ MIN_GAP + son cevap ders dışı.
 *  - yanlış: seri sıfırlanır, ertesi gün tekrar; known ise unc'ye düşer.
 */
export function recordAnswer(p, { itemId, qid, correct, kind = 'lesson', chosen = null, now }) {
  if (!itemId) return p
  const it = { ...getItem(p, itemId), goodQs: [...getItem(p, itemId).goodQs], conf: { ...getItem(p, itemId).conf } }
  it.lastQ = qid ?? it.lastQ
  it.lastAt = now
  if (correct) {
    it.correct++
    if (qid && !it.goodQs.includes(qid)) it.goodQs.push(qid)
    if (it.streak === 0) it.streakStart = now
    it.streak++
    if (!LESSON_KINDS.has(kind)) it.box++
    if (it.status === 'new') it.status = 'unc'
    const spaced = !LESSON_KINDS.has(kind) && now - it.streakStart >= MIN_GAP
    if (it.status === 'unc' && it.goodQs.length >= 2 && it.streak >= 2 && spaced) it.status = 'known'
    it.due = now + intervalDays(p, it.box) * DAY
  } else {
    it.wrong++
    if (chosen != null) it.conf[chosen] = (it.conf[chosen] || 0) + 1
    it.streak = 0
    it.streakStart = null
    it.box = 0
    if (it.status === 'known') it.status = 'unc'
    it.due = now + intervalDays(p, 0) * DAY
  }
  const log = [...p.log, { t: now, id: itemId, qid: qid ?? null, ok: !!correct, kind }].slice(-LOG_CAP)
  return { ...p, items: { ...p.items, [itemId]: it }, log }
}

// Dışarıdan (test/kontrol) doğrudan durum atamak için.
export function setStatus(p, itemId, status, { now, source = null, box = 0 } = {}) {
  const it = { ...getItem(p, itemId), status, source, box }
  if (now != null) it.due = now + intervalDays(p, box) * DAY
  return { ...p, items: { ...p.items, [itemId]: it } }
}

export function counts(p, itemIds) {
  const c = { known: 0, unc: 0, new: 0 }
  for (const id of itemIds) c[statusOf(p, id)]++
  return c
}

/**
 * Hızlı kart cevabı (öğrencinin kendi değerlendirmesi). Durumu (known/unc) DEĞİŞTİRMEZ: o, gerçek sorularla kazanılır.
 * Yalnız sırayı etkiler: 'dont' → hemen tekrara, 'unsure' → en geç yarın, 'know' → plan aynı kalır.
 */
export function recordFlash(p, { itemId, rating, now }) {
  if (!itemId) return p
  const it = { ...getItem(p, itemId) }
  if (rating === 'dont') { it.due = now; it.flashMiss = (it.flashMiss || 0) + 1 }
  else if (rating === 'unsure') it.due = Math.min(it.due ?? Infinity, now + DAY)
  const log = [...p.log, { t: now, id: itemId, qid: null, ok: rating === 'know', kind: 'flash' }].slice(-LOG_CAP)
  return { ...p, items: { ...p.items, [itemId]: it }, log }
}
