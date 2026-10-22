// Veli raporu: öğrencinin ilerlemesinden tek sayfalık özet. Saf fonksiyon, testli.
import { dayStamp, streakOf, weekCounts } from './goal.js'

const DAY_MS = 864e5

export function buildReport({ progress, daily, doneDays, items, now }) {
  const week = weekCounts(daily, now)
  const since = now - 7 * DAY_MS
  const recent = (progress.log || []).filter(e => e.t >= since)
  const ok = recent.filter(e => e.ok).length
  const state = { known: 0, unc: 0, new: 0 }
  for (const it of items) state[progress.items[it.id]?.status || 'new']++
  const hardest = items
    .map(it => ({ it, p: progress.items[it.id] }))
    .filter(x => x.p && x.p.wrong > 0 && x.p.status !== 'known')
    .sort((a, b) => b.p.wrong - a.p.wrong)
    .slice(0, 5)
    .map(x => ({ display: x.it.display, meaning: x.it.meaning_tr, wrong: x.p.wrong }))
  return {
    streak: streakOf(daily, now),
    week,
    weekTotal: week.reduce((n, d) => n + d.n, 0),
    activeDays: week.filter(d => d.n > 0).length,
    accuracy: recent.length ? Math.round((100 * ok) / recent.length) : null,
    lessonsDone: Object.keys(doneDays || {}).length,
    state,
    total: items.length,
    hardest,
    date: dayStamp(now),
  }
}
