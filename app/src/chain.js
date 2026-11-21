// Zinciri kırma: son haftaların gün gün halkaları, en uzun zincir ve kilometre taşı. Saf fonksiyon, testli.
import { dayStamp, streakInfo } from './goal.js'

export const MILESTONES = [7, 14, 30, 50, 75, 100, 150, 200]

const atNoon = s => new Date(s + 'T12:00:00').getTime()
const addDays = (t, n) => { const d = new Date(t); d.setDate(d.getDate() + n); return d.getTime() }

/**
 * weeks: kaç hafta (pazartesi–pazar satırları, son satır bu hafta).
 * Dönen: { rows: [[{ stamp, on, saved, today, future }]], streak, best, text, milestone }
 */
export function chainView(daily = {}, now, { weeks = 4, best = 0 } = {}) {
  const { n: streak, saved } = streakInfo(daily, now)
  const savedSet = new Set(saved)
  const todayStamp = dayStamp(now)
  const monday = addDays(atNoon(todayStamp), -((new Date(now).getDay() + 6) % 7))
  const rows = []
  for (let w = weeks - 1; w >= 0; w--) {
    const row = []
    for (let i = 0; i < 7; i++) {
      const t = addDays(monday, i - 7 * w)
      const stamp = dayStamp(t)
      row.push({ stamp, on: daily[stamp] > 0, saved: savedSet.has(stamp), today: stamp === todayStamp, future: stamp > todayStamp })
    }
    rows.push(row)
  }
  const top = Math.max(best, streak)
  const doneToday = daily[todayStamp] > 0
  const milestone = doneToday && MILESTONES.includes(streak) ? streak : null
  const text = milestone ? `${streak} gün! Bu zincir artık senin alışkanlığın 🎉`
    : streak >= 2 ? `${streak} günlük zincir${top > streak ? ` · en uzun ${top}` : ' · en uzun zincirin bu!'}${doneToday ? '' : ' · bugünün halkası seni bekliyor'}`
    : streak === 1 ? (doneToday ? 'İlk halka tamam. Yarın ikinciyi ekle!' : 'Zincir başladı; bugün ikinci halkayı ekle.')
    : top > 0 ? `Yeni zincir bugün başlıyor. En uzun zincirin ${top} gün; onu geçebilirsin.`
    : 'Her gün bir halka: bugün çalışırsan zincirin ilk halkası takılır.'
  return { rows, streak, best: top, text, milestone }
}
