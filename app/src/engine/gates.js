// Günlük ders sınırı ve kalıcılık kontrolü açılma kuralları. Saf fonksiyonlar.
import { DAY } from './progress.js'

export const LESSONS_PER_DAY = 1
// Ünitenin ilk dersi bittikten kaç takvim günü sonra açılır (Gün 8 → +7, Gün 15 → +14).
export const RETENTION_AFTER_DAYS = { day08: 7, day15: 14 }

const startOfDay = ts => { const d = new Date(ts); return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() }
export const dayKey = ts => { const d = new Date(ts); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` }
export const calendarDaysBetween = (a, b) => Math.round((startOfDay(b) - startOfDay(a)) / DAY)

export const lessonsToday = (doneDays, now) => Object.values(doneDays || {}).filter(d => dayKey(d.at) === dayKey(now)).length
export const canStartLesson = (doneDays, now, limit = LESSONS_PER_DAY) => lessonsToday(doneDays, now) < limit
export const nextLessonOpensAt = now => startOfDay(now) + DAY

/**
 * Kalıcılık kontrolünün durumu:
 *  done | not-started | wait (days) | need-lessons (unseen) | ready
 * Kontroldeki kelimeler henüz hiç görülmediyse açılmaz (öğretilmemiş şeyi ölçmeyiz).
 */
export function retentionState({ section, unit, doneDays, retentions, progress, now }) {
  const rec = retentions?.[`u${unit}:${section.id}`]
  if (rec) return { status: 'done', ...rec }
  const starts = Object.entries(doneDays || {}).filter(([k]) => k.startsWith(`u${unit}d`)).map(([, v]) => v.at)
  if (!starts.length) return { status: 'not-started' }
  const days = RETENTION_AFTER_DAYS[section.id] - calendarDaysBetween(Math.min(...starts), now)
  if (days > 0) return { status: 'wait', days }
  const unseen = section.questions.filter(q => !progress.items[q.item]).length
  if (unseen) return { status: 'need-lessons', unseen }
  return { status: 'ready' }
}
