// Ünite ön/son testi ve haftalık quiz: soru havuzundan otomatik seçim. Saf fonksiyonlar, testli.
import { dayStamp } from './goal.js'

const DAY_MS = 864e5
const PRE_ROLES = ['kullan', 'review', 'sina']           // ön test: daha basit, tanıma ağırlıklı
const POST_ROLES = ['sina', 'review', 'retention', 'kullan'] // son test: LGS tarzı öncelikli

const shuffle = (a, rng) => { const x = [...a]; for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [x[i], x[j]] = [x[j], x[i]] } return x }

/** İfadelerden n tanesini seçip her birine bir soru verir; exclude'daki sorular (ör. ön testte çıkanlar) kullanılmaz. */
export function pickQuiz(qIndex, itemIds, { n = 10, roles = PRE_ROLES, exclude = new Set(), preferLgs = false, rng = Math.random } = {}) {
  const out = []
  for (const id of shuffle(itemIds, rng)) {
    if (out.length >= n) break
    const pool = (qIndex.get(id) || []).filter(q => roles.includes(q.role) && !exclude.has(q.id) && q.options?.length >= 3)
    if (!pool.length) continue
    const rank = q => roles.indexOf(q.role) - (preferLgs && q.lgs_like ? 10 : 0)
    const best = Math.min(...pool.map(rank))
    const top = pool.filter(q => rank(q) === best)
    out.push({ ...top[Math.floor(rng() * top.length)], itemId: id })
  }
  return out
}

export const preQuiz = (qIndex, unit, rng) => pickQuiz(qIndex, unit.items.map(i => i.id), { n: 10, roles: PRE_ROLES, rng })
export const postQuiz = (qIndex, unit, preQids = [], rng) =>
  pickQuiz(qIndex, unit.days.flatMap(d => d.new_items), { n: 15, roles: POST_ROLES, exclude: new Set(preQids), preferLgs: true, rng })

/** Haftalık quiz: son 7 günde çalışılan (yeni olmayan) ifadelerden 10 soru. */
export function weeklyItems(p, now) {
  const since = now - 7 * DAY_MS
  const ids = [...new Set((p.log || []).filter(e => e.t >= since && e.kind !== 'flash').map(e => e.id))]
  return ids.filter(id => p.items[id] && p.items[id].status !== 'new')
}
export const weeklyQuiz = (qIndex, p, now, rng) => pickQuiz(qIndex, weeklyItems(p, now), { n: 10, roles: POST_ROLES, preferLgs: true, rng })

/** Haftanın anahtarı: o haftanın pazartesisi (yerel saat). */
export function weekKey(now) {
  const d = new Date(now)
  const back = (d.getDay() + 6) % 7
  return dayStamp(new Date(d.getFullYear(), d.getMonth(), d.getDate() - back).getTime())
}
/** Cuma–pazar arası ve bu hafta henüz çözülmemişse, en az 5 ifade varsa öne çıkar. */
export const weeklyDue = (p, weekly = {}, now) => {
  const wd = new Date(now).getDay()
  return (wd === 5 || wd === 6 || wd === 0) && !weekly[weekKey(now)] && weeklyItems(p, now).length >= 5
}

export const pct = r => (r && r.n ? Math.round((100 * r.ok) / r.n) : null)
