import { DAY, getItem } from './progress.js'

/** Bir tekrar oturumunda sorulan tavan. Metinler ve ekran aynı sayıyı kullanır. */
export const REVIEW_CAP = 10

/** Vakti gelmiş tekrarlar: en çok gecikenden başlar, eşitlikte çok yanlış yapılan önde. Günlük tavan `limit`. */
export function dueItems(p, now, { limit = REVIEW_CAP, exclude = [] } = {}) {
  const skip = new Set(exclude)
  return Object.entries(p.items)
    .filter(([id, it]) => !skip.has(id) && it.due != null && it.due <= now && (it.status !== 'new' || it.wrong > 0))
    .sort(([, a], [, b]) => a.due - b.due || b.wrong - a.wrong)
    .slice(0, limit)
    .map(([id]) => id)
}

export function dueCount(p, now) {
  return Object.values(p.items).filter(it => it.due != null && it.due <= now && (it.status !== 'new' || it.wrong > 0)).length
}

export function nextDueAt(p, now) {
  const future = Object.values(p.items).map(it => it.due).filter(d => d != null && d > now)
  return future.length ? Math.min(...future) : null
}

export const daysUntil = (ts, now) => Math.ceil((ts - now) / DAY)
export const lastSeenAt = (p, id) => getItem(p, id).lastAt

export function dueCountBy(p, ts) {
  return Object.values(p.items).filter(it => it.due != null && it.due <= ts && (it.status !== 'new' || it.wrong > 0)).length
}
