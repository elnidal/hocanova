// Soru dizini, tekrarda soru seçimi, şık karıştırma ve cevap kontrolü.
import { getItem } from './progress.js'

export const mulberry32 = a => () => {
  a |= 0; a = (a + 0x6d2b79f5) | 0
  let t = Math.imul(a ^ (a >>> 15), 1 | a)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

/** itemId → o kelimeyle ilgili tüm sorular (role: sezdir/kullan/sina/review/retention/drill).
 *  drill: içerik derlemesinde üretilen anlam/çeviri/dinle/zıt soruları; listen false ise (ses yok) dinleme soruları alınmaz. */
export function buildQuestionIndex({ units, retention, listen = true }) {
  const idx = new Map()
  const add = (itemId, role, q, meta) => {
    if (!itemId || !q) return
    if (!idx.has(itemId)) idx.set(itemId, [])
    idx.get(itemId).push({ ...q, itemId, role, ...meta })
  }
  for (const u of units) for (const d of u.days || []) {
    const meta = { unit: u.unit, day: d.day }
    for (const s of d.steps || []) {
      for (const role of ['sezdir', 'kullan', 'sina']) add(s.item, role, s[role], meta)
      add(s.item, 'review', s.tekrar, meta) // hafif mod: ders günü gösterilmeyen, tekrarda kullanılan soru
    }
    for (const q of d.review || []) add(q.item, 'review', q, meta)
  }
  for (const u of units) for (const q of u.drills || []) if (listen || q.type !== 'dinle') add(q.item, 'drill', q, { unit: u.unit })
  for (const sec of retention?.sections || []) for (const q of sec.questions) add(q.item, 'retention', q, {})
  return idx
}

const REVIEW_ROLES = ['review', 'retention', 'kullan', 'sina', 'drill']

/** Tekrar için soru seç: önce hiç doğru yapılmamış, sonra son sorulandan farklı olan; sezdir en son çare. */
export function pickQuestion(index, itemId, p, { roles = REVIEW_ROLES, rng = Math.random } = {}) {
  const all = index.get(itemId) || []
  const it = getItem(p, itemId)
  let pool = all.filter(q => roles.includes(q.role))
  if (!pool.length) pool = all
  if (!pool.length) return null
  const fresh = pool.filter(q => !it.goodQs.includes(q.id) && q.id !== it.lastQ)
  const notLast = pool.filter(q => q.id !== it.lastQ)
  const from = fresh.length ? fresh : notLast.length ? notLast : pool
  return from[Math.floor(rng() * from.length)]
}

/** Şıkları karıştırır. Kaynakta doğru cevap hep options[0]'dır; burada correctIndex'e çevrilir. */
export function shuffleOptions(q, rng = Math.random) {
  const order = q.options.map((_, i) => i)
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]]
  }
  return { ...q, options: order.map(i => q.options[i]), correctIndex: order.indexOf(q.answer ?? 0), whyWrong: whyMap(q) }
}

/** why_wrong (yanlış şıklar sırasıyla) → şık metni → açıklama. */
const whyMap = q => {
  if (q.whyWrong || !q.why_wrong) return q.whyWrong // karıştırılmış soruda eşleme hazır
  const wrong = q.options.filter((_, i) => i !== (q.answer ?? 0))
  return Object.fromEntries(wrong.map((o, k) => [o, q.why_wrong[k]]).filter(([, r]) => r))
}

/** Seçilen yanlış şıkkın neden yanlış olduğu (karıştırılmış ya da ham soruda); yoksa null. */
export const wrongReason = (q, optionText) => (optionText == null ? null : whyMap(q)?.[optionText] || null)

/** Kelimenin alıştırma sorusu: types sırasıyla ilk bulunan tip. */
export const drillFor = (index, itemId, types) => {
  const qs = (index.get(itemId) || []).filter(q => q.role === 'drill')
  for (const t of types) { const q = qs.find(x => x.type === t); if (q) return q }
  return null
}

export const isCorrect = (shuffled, pickedIndex) => pickedIndex === shuffled.correctIndex

/** Aynı oturumda yanlış yapılan kelime için yeniden sorarken farklı bir soru seç (aynı soruyu tekrar sorma; sezdir hariç). */
export function alternativeQuestion(index, itemId, askedIds, { rng = Math.random } = {}) {
  const pool = (index.get(itemId) || []).filter(q => q.role !== 'sezdir' && !askedIds.has(q.id))
  return pool.length ? pool[Math.floor(rng() * pool.length)] : null
}
