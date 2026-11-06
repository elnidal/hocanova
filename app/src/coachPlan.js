// Hoca Nova'nın günlük planı: öğrenciye "şimdi ne yapmalıyım?" sorusunun sıralı cevabı. Saf fonksiyonlar, testli.
import { dayStamp } from './goal.js'
import { weakUnits, unitOfItem } from './lgsMini.js'

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

const WEEK_MS = 7 * DAY_MS
export const REVIEW_DAYS = 30 // son 30 gün yeni ders değil, tekrar ve deneme
const AY = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']

/** Haftanın başı: pazartesi 00.00 (yerel saat). */
const weekStartOf = now => {
  const d = new Date(now)
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - ((d.getDay() + 6) % 7)).getTime()
}

/** "Nisan ortasında" gibi yaklaşık tarih. */
const approxDate = t => {
  const d = new Date(t), g = d.getDate()
  return `${AY[d.getMonth()]} ${g <= 10 ? 'başında' : g <= 20 ? 'ortasında' : 'sonunda'}`
}

/**
 * Tempo: kalan dersleri son 30 güne kadar haftalara böler. Hedef hafta başındaki duruma göre hesaplanır,
 * hafta içinde değişmez. Dönen mode: 'pace' | 'complete' (ders kalmadı) | 'final' (son 30 gün).
 */
export function pacePlan({ totalLessons, doneDays = {}, now, lgs = LGS_DATE, reviewDays = REVIEW_DAYS }) {
  const ats = Object.values(doneDays).map(d => d?.at ?? 0)
  const start = weekStartOf(now)
  const weekDone = ats.filter(t => t >= start).length
  const lastWeekDone = ats.filter(t => t >= start - WEEK_MS && t < start).length
  const left = Math.max(0, totalLessons - ats.length)
  if (!left) return { mode: 'complete', left: 0, weekDone }
  const end = lgs - reviewDays * DAY_MS
  if (now >= end) return { mode: 'final', left, weekDone }
  const leftAtStart = left + weekDone
  const weeks = (end - start) / WEEK_MS
  const need = Math.ceil(leftAtStart / weeks)
  const target = Math.min(7, need)
  const prevTarget = Math.min(7, Math.ceil((leftAtStart + lastWeekDone) / (weeks + 1)))
  const startedBefore = ats.length > weekDone
  return {
    mode: 'pace', left, weekDone, target,
    tight: need > 7, // her gün bir ders bile yetmiyor
    raised: startedBefore && target > prevTarget ? prevTarget : null, // tempo geçen haftaya göre arttıysa eski değer
    finishAt: start + Math.ceil(leftAtStart / target) * WEEK_MS,
  }
}

/** Tempo cümlesi. Suçlamaz: geride kalınca yalnız yeni tempoyu söyler. */
export function paceText(p) {
  if (p.mode === 'complete') return 'Bütün dersler bitti! Şimdi tekrar ve Mini LGS zamanı.'
  if (p.mode === 'final') return 'Son düzlük: bu günlerde yeni dersten çok tekrar ve Mini LGS işe yarar.'
  if (p.tight) return 'Her gün bir ders iyi bir tempo. Hepsi yetişmezse en çok soru gelen konulara öncelik veririz.'
  const finish = `Bu tempoyla üniteler ${approxDate(p.finishAt)} biter; kalan süre tekrar ve deneme için.`
  if (p.raised) return `Tempo haftada ${p.raised} dersten ${p.target} derse çıktı; sorun değil, hâlâ yetişiyoruz. ${finish}`
  if (p.weekDone >= p.target) return `Bu haftanın hedefi tamam! Devam etmek istersen sınava daha da erken hazır olursun.`
  return finish
}

/**
 * Geçen haftanın karnesi (pazartesi–pazar): ders, doğru yüzdesi, Mini LGS, en çok zorlanılan ünite.
 * Daha önce hiç çalışılmadıysa null. Yüzde için en az 5 cevap gerekir; zayıf ünite için en az 3 yanlış.
 */
export function weeklyReport({ state, now }) {
  const start = weekStartOf(now), from = start - WEEK_MS, before = from - WEEK_MS
  const lessonAts = Object.values(state.doneDays || {}).map(d => d?.at ?? 0)
  const log = (state.progress?.log || []).filter(e => e.qid && e.kind !== 'flash')
  if (!lessonAts.some(t => t < start) && !log.some(e => e.t < start)) return null
  const acc = (a, b) => {
    const week = log.filter(e => e.t >= a && e.t < b)
    return week.length >= 5 ? Math.round((week.filter(e => e.ok).length / week.length) * 100) : null
  }
  const wrong = {}
  for (const e of log) {
    if (e.t < from || e.t >= start || e.ok) continue
    const u = unitOfItem(e.id)
    if (u) wrong[u] = (wrong[u] || 0) + 1
  }
  const top = Object.entries(wrong).sort((a, b) => b[1] - a[1] || a[0] - b[0])[0]
  const minis = state.miniLgs || []
  const weekMinis = minis.filter(m => m.now >= from && m.now < start)
  const lastMini = weekMinis.at(-1)
  const prevMini = lastMini ? minis[minis.indexOf(lastMini) - 1] : null
  return {
    lessons: lessonAts.filter(t => t >= from && t < start).length,
    answers: log.filter(e => e.t >= from && e.t < start).length,
    accuracy: acc(from, start),
    prevAccuracy: acc(before, from),
    net: lastMini ? lastMini.net : null,
    netDiff: lastMini && prevMini ? Math.round((lastMini.net - prevMini.net) * 100) / 100 : null,
    weakUnit: top && top[1] >= 3 ? +top[0] : null,
    weakCount: top && top[1] >= 3 ? top[1] : 0,
  }
}

/** Karnenin Nova cümlesi: önce kazanım, sonra tek öneri. Suçlamaz. */
export function reportText(r) {
  if (!r.lessons && !r.answers && r.net == null) return 'Geçen hafta ara verdin, olur böyle. Bu hafta tek dersle yeniden başlıyoruz.'
  const num = x => String(x).replace('.', ',')
  const win = r.netDiff > 0 ? `Mini LGS netin ${num(r.netDiff)} arttı!`
    : r.accuracy != null && r.prevAccuracy != null && r.accuracy - r.prevAccuracy >= 5 ? `Doğru oranın %${r.prevAccuracy}'den %${r.accuracy}'e çıktı!`
    : r.accuracy >= 80 ? `%${r.accuracy} doğru, çok sağlam bir hafta!`
    : r.lessons ? `${r.lessons} ders bitirdin, emeğin birikiyor.`
    : 'Tekrarlarını yaptın, kalıcılık böyle gelir.'
  return r.weakUnit ? `${win} En çok Ünite ${r.weakUnit} zorladı; kısa bir tamir iyi gelir.` : win
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
