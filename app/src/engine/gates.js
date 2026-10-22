// Günlük ders sınırı ve kalıcılık kontrolü açılma kuralları. Saf fonksiyonlar.
import { DAY } from './progress.js'

// Ünitenin ilk dersi bittikten kaç takvim günü sonra açılır (Gün 8 → +7, Gün 15 → +14).
export const RETENTION_AFTER_DAYS = { day08: 7, day15: 14 }

const startOfDay = ts => { const d = new Date(ts); return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() }
export const dayKey = ts => { const d = new Date(ts); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` }
export const calendarDaysBetween = (a, b) => Math.round((startOfDay(b) - startOfDay(a)) / DAY)

// Günlük kilit yok: öğrenci istediği kadar devam eder. Çok yeni ifade öğrenilirse yalnız yumuşak bir uyarı gösterilir.
export const NEW_ITEMS_SOFT_CAP = 15
/** Bugün bitirilen derslerin yeni ifade sayısı (eski kayıtlarda n yoksa 5 sayılır). */
export const newItemsToday = (doneDays, now) =>
  Object.values(doneDays || {}).filter(d => dayKey(d.at) === dayKey(now)).reduce((sum, d) => sum + (d.n ?? 5), 0)
export const overSoftCap = (doneDays, now, cap = NEW_ITEMS_SOFT_CAP) => newItemsToday(doneDays, now) >= cap

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

/** Yarın gece yarısına kadar (yarın dahil) vadesi gelmiş tekrarları saymak için zaman damgası. */
export const endOfTomorrow = now => startOfDay(now) + 2 * DAY - 1
