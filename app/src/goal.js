// Günlük hedef ve kelime listesi: saf yardımcılar (arayüzden bağımsız, testli).
export const GOAL_OPTIONS = [10, 20, 50, 100]
export const DEFAULT_GOAL = { target: 20, source: 'self', note: null }

export const dayStamp = ts => {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// Bugünkü çözülen soru sayısını 1 artırır; yalnız son 60 gün tutulur.
export function countAnswer(daily = {}, ts) {
  const k = dayStamp(ts)
  const next = { ...daily, [k]: (daily[k] || 0) + 1 }
  const keys = Object.keys(next).sort()
  for (const old of keys.slice(0, Math.max(0, keys.length - 60))) delete next[old]
  return next
}

export const todayCount = (daily, ts) => daily?.[dayStamp(ts)] || 0

// Öğretmen ödev bağlantısı: ?odev=100&not=Bugün%20100%20soru → { target, note }
export function parseAssignment(search) {
  const p = new URLSearchParams(search)
  const target = parseInt(p.get('odev'), 10)
  if (!(target >= 5 && target <= 300)) return null
  return { target, note: (p.get('not') || '').trim().slice(0, 140) || null }
}

// Kelime listesi: ilk N gün ya da tüm ünite; gün gün gruplanır, günlere girmeyenler "Diğer".
export function buildWordList(unit, firstDays = null) {
  const byId = Object.fromEntries(unit.items.map(i => [i.id, i]))
  const days = [...unit.days].sort((a, b) => a.day - b.day).slice(0, firstDays || undefined)
  const row = id => byId[id] && { id, display: byId[id].display, meaning: byId[id].meaning_tr, note: byId[id].trap_note || null }
  const used = new Set()
  const groups = days.map(d => ({
    title: `Gün ${d.day} · ${d.title}`,
    rows: d.new_items.map(row).filter(Boolean),
  })).filter(g => g.rows.length)
  groups.forEach(g => g.rows.forEach(r => used.add(r.id)))
  if (!firstDays) {
    const rest = unit.items.filter(i => !used.has(i.id)).map(i => row(i.id))
    if (rest.length) groups.push({ title: 'Diğer ifadeler', rows: rest })
  }
  return groups
}

const DAY_MS = 864e5

// Seri: üst üste çalışılan gün sayısı. Bugün henüz çalışılmadıysa dünden geriye sayılır (gün bitene kadar zincir sürer).
export function streakOf(daily = {}, now) {
  let n = 0
  let t = now
  if (!daily[dayStamp(t)]) t -= DAY_MS
  while (daily[dayStamp(t)] > 0) { n++; t -= DAY_MS }
  return n
}

// Son kez çalışılandan bu yana geçen gün (hiç çalışılmadıysa null; bugün çalışıldıysa 0).
export function daysAway(daily = {}, now) {
  const keys = Object.keys(daily).filter(k => daily[k] > 0).sort()
  if (!keys.length) return null
  const [y, m, d] = keys[keys.length - 1].split('-').map(Number)
  const last = new Date(y, m - 1, d).getTime()
  const today = new Date(dayStamp(now) + 'T00:00:00').getTime()
  return Math.round((today - last) / DAY_MS)
}

// Ana ekrandaki Hoca Nova mesajı: duruma göre (hedef, seri, ara verme, bekleyen tekrar).
export function coachMessage({ daily, goal, due, now, fallback }) {
  const done = todayCount(daily, now)
  const away = daysAway(daily, now)
  const streak = streakOf(daily, now)
  if (done >= goal.target) return `Bugünkü hedefi tamamladın, helal olsun! ${streak >= 2 ? `${streak} gündür aralıksız çalışıyorsun 🔥` : 'Yarın görüşürüz 👋'}`
  if (done > 0) return `Bugün ${done} soru çözdün, güzel gidiyor. Hedefe ${goal.target - done} soru kaldı.`
  if (away != null && away >= 2) return `${away} gündür görüşemedik, sorun değil! Bugün 5 dakikada yetişiriz.`
  if (streak >= 2) return `${streak} gündür üst üste çalışıyorsun. Zinciri bozmayalım, bugün de azıcık yapalım 🔥`
  if (due > 0) return `${due} ifade tekrar bekliyor. Kalıcı öğrenmenin sırrı tekrar: önce onlara bakalım.`
  return fallback
}

// Son 7 günün günlük soru sayıları (eskiden yeniye).
export function weekCounts(daily = {}, now) {
  return Array.from({ length: 7 }, (_, i) => {
    const t = now - (6 - i) * DAY_MS
    return { stamp: dayStamp(t), n: daily[dayStamp(t)] || 0, wd: new Date(t).getDay() }
  })
}
