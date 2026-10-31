// Hoca Nova'nın günlük planı: öğrenciye "şimdi ne yapmalıyım?" sorusunun sıralı cevabı. Saf fonksiyonlar, testli.
import { dayStamp } from './goal.js'
import { weakUnits } from './lgsMini.js'

const DAY_MS = 864e5
// MEB'in açıkladığı tarih: 13 Haziran 2027 Pazar (sözel oturum 09:30).
export const LGS_DATE = new Date(2027, 5, 13, 9, 30).getTime()

export const daysToLgs = (now, lgs = LGS_DATE) => Math.max(0, Math.ceil((lgs - now) / DAY_MS))

const today = (t, now) => t != null && dayStamp(t) === dayStamp(now)

/**
 * Adımlar: { key, title, note, done, action }. action: Home'daki işleyicinin adı.
 * ctx: { state, due, nextDay (ders günü nesnesi ya da null), weekly (Cuma quiz'i hazır mı), unitDone, now }
 */
export function coachPlan({ state, due, nextDay, weekly, unitDone, now }) {
  const steps = []
  const doneDays = Object.values(state.doneDays || {})
  const lessonsTotal = doneDays.length
  const reviewedToday = (state.reviews || []).some(r => today(r.at, now))
  const lessonToday = doneDays.some(d => today(d.at, now))
  const minis = state.miniLgs || []
  const lastMini = minis.at(-1)
  const repairs = state.repairs || []

  if (due > 0 || reviewedToday) steps.push({
    key: 'review', action: 'review', done: due === 0,
    title: due ? `${due} ifadeyi tekrar et` : 'Tekrar tamam',
    note: 'Unutmadan hemen önce sormak, kalıcılığın sırrı.',
  })

  if (nextDay || lessonToday) steps.push({
    key: 'lesson', action: 'lesson', done: lessonToday,
    title: lessonToday ? 'Bugünün dersi tamam' : `Gün ${nextDay.day} dersini yap`,
    note: lessonToday ? 'İstersen bir ders daha açabilirsin.' : 'Yeni ifadeler: kart, kısa sahne, alıştırma.',
  })
  else if (unitDone) steps.push({ key: 'post', action: 'post', done: false, title: 'Ünite son testini çöz', note: 'Ünitenin başındaki hâlinle karşılaştıracağız.' })

  if (weekly) steps.push({ key: 'weekly', action: 'weekly', done: false, title: "Cuma quiz'ini çöz", note: 'Bu haftanın ifadelerinden 10 soru.' })

  // Mini LGS: en az 3 ders sonra, haftada bir
  if (lessonsTotal >= 3) {
    const recent = lastMini && now - lastMini.now < 7 * DAY_MS
    if (!recent || today(lastMini.now, now)) steps.push({
      key: 'mini', action: 'mini', done: !!recent,
      title: recent ? `Mini LGS tamam · net ${String(lastMini.net).replace('.', ',')}` : 'Haftalık Mini LGS',
      note: recent ? 'Bir sonraki deneme haftaya.' : '10 soru, 15 dk: bu haftaki netini görelim.',
    })
  }

  // Tamir: son denemede kayıp varsa ve o denemeden sonra tamir yapılmadıysa
  const weak = lastMini ? weakUnits(lastMini.byUnit) : []
  if (weak.length) {
    const repaired = repairs.some(r => r.at >= lastMini.now)
    if (!repaired || repairs.some(r => r.at >= lastMini.now && today(r.at, now))) steps.push({
      key: 'repair', action: 'repair', done: repaired, units: weak,
      title: repaired ? 'Tamir tamam' : `Ünite ${weak.join(', ')} için tamir seti`,
      note: 'Son denemede puan kaybettiğin yerler.',
    })
  }

  return steps
}

/** Planın başına Nova'nın tek cümlesi. */
export function planHeadline(steps, days) {
  const left = steps.filter(s => !s.done).length
  if (!steps.length) return `LGS'ye ${days} gün var. Bugün planında bir şey kalmadı; kartlarla 2 dakika ısınabilirsin.`
  if (!left) return `Bugünkü planı bitirdin, işte koçluk bu! LGS'ye ${days} gün var ve sen her gün bir adım öndesin.`
  return left === steps.length
    ? `Bugün ${left} adım var. Sırayla gidelim; çerçeveli olandan başla.`
    : `Güzel gidiyorsun! Bugün ${left} adım kaldı; sıradaki çerçeveli olan.`
}
