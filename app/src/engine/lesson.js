import { statusOf } from './progress.js'
import { dueItems } from './schedule.js'

/**
 * Günlük ders planı.
 *  - Hafif mod: kart → kullan → sına.
 *  - Hikâyeli gün: kartlar (known olmayan birimler) → kısa İngilizce sahne → kullan + sına; uzun hikâye isteğe bağlı (Lesson.jsx).
 *    "ileri" seviyede eski akış bonus olarak sürer: önce hikâye, sonra her birim için sezdir → kullan → sına.
 *  - Bilinen birimde tanıtım adımı (kart / sezdir) atlanır.
 * extraReview: dersin kendi tekrar sorularına ek, vakti gelmiş kelimeler (tavanlı).
 */
export function planLesson(day, p, now, { reviewLimit = 6 } = {}) {
  const light = day.mode === 'light'
  const advanced = !light && p.level === 'ileri'
  const steps = day.steps.map(s => {
    const known = statusOf(p, s.item) === 'known'
    const intro = light ? 'card' : advanced ? 'sezdir' : null
    return { item: s.item, known, parts: [...(intro && !known ? [intro] : []), 'kullan', 'sina'] }
  })
  const inDay = day.steps.map(s => s.item)
  return {
    mode: light ? 'light' : advanced ? 'advanced' : 'cardFirst',
    steps,
    cardItems: light ? [] : steps.filter(s => !s.known).map(s => s.item), // hikâyeli günlerde ayrı kart aşaması
    review: day.review || [],
    extraReview: dueItems(p, now, { limit: reviewLimit, exclude: inDay }),
  }
}

/** Ana ekranda gösterilen ders süresi (dk). Hikâyeli günlerin içerikteki süresi uzun hikâyeyi de sayar;
 *  yeni akışta hikâye isteğe bağlı: kart ~20 sn, sahne ~30 sn, soru ~20 sn. Hafif modda içerikteki süre kullanılır. */
export const lessonMinutes = day => day.mode === 'light' ? day.est_minutes
  : Math.max(3, Math.round(day.new_items.length / 3 + (2 * day.new_items.length + (day.review?.length || 0)) / 3 + 0.5))
