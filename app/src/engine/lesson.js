import { statusOf } from './progress.js'
import { dueItems } from './schedule.js'

/**
 * Günlük ders planı. Bilinen birimde "sezdir" atlanır (anlamı zaten biliyor), kullan + sına yine gelir.
 * extraReview: dersin kendi tekrar sorularına ek, vakti gelmiş kelimeler (tavanlı).
 */
export function planLesson(day, p, now, { reviewLimit = 6 } = {}) {
  const steps = day.steps.map(s => {
    const known = statusOf(p, s.item) === 'known'
    return { item: s.item, parts: known ? ['kullan', 'sina'] : ['sezdir', 'kullan', 'sina'], skippedSezdir: known }
  })
  const inDay = day.steps.map(s => s.item)
  return { steps, review: day.review || [], extraReview: dueItems(p, now, { limit: reviewLimit, exclude: inDay }) }
}
