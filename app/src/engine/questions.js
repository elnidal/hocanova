// Soru dizini, tekrarda soru seçimi, şık karıştırma ve cevap kontrolü.
import { getItem } from './progress.js'

export const mulberry32 = a => () => {
  a |= 0; a = (a + 0x6d2b79f5) | 0
  let t = Math.imul(a ^ (a >>> 15), 1 | a)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

/** itemId → o kelimeyle ilgili tüm sorular (role: sezdir/kullan/sina/review/retention). */
export function buildQuestionIndex({ units, retention }) {
  const idx = new Map()
  const add = (itemId, role, q, meta) => {
    if (!itemId || !q) return
    if (!idx.has(itemId)) idx.set(itemId, [])
    idx.get(itemId).push({ ...q, itemId, role, ...meta })
  }
  for (const u of units) for (const d of u.days || []) {
    const meta = { unit: u.unit, day: d.day }
    for (const s of d.steps || []) for (const role of ['sezdir', 'kullan', 'sina']) add(s.item, role, s[role], meta)
    for (const q of d.review || []) add(q.item, 'review', q, meta)
  }
  for (const sec of retention?.sections || []) for (const q of sec.questions) add(q.item, 'retention', q, {})
  return idx
}

const REVIEW_ROLES = ['review', 'retention', 'kullan', 'sina']

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
  return { ...q, options: order.map(i => q.options[i]), correctIndex: order.indexOf(q.answer ?? 0) }
}

export const isCorrect = (shuffled, pickedIndex) => pickedIndex === shuffled.correctIndex
