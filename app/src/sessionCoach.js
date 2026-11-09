// Günlük koç döngüsü: bugünkü iş, gerekçe ve oturum sonu. Yeni motor yok; mevcut planın üstünde.
import { daysAway } from './goal.js'
import { coachPlan } from './coachPlan.js'
import { REVIEW_CAP } from './engine/schedule.js'
import { unitOfItem } from './lgsMini.js'

const DAY_MS = 864e5
const MIN_ANSWERS = 3
const RECENT_MIN = 5
const RECENT_DAYS = 7
const SECTION = [['A', 'kelime tanıma'], ['B', 'bağlam'], ['C', 'sınavda kullanma']]

const studied = state => Object.keys(state.doneDays || {}).length > 0
  || (state.reviews || []).length > 0
  || (state.progress?.log || []).some(e => e.kind === 'lesson' || e.kind === 'review')

/** Başlangıç testinin bölüm sayıları. Puan eksikse null; yeterlilik cümlesi kurmaz. */
export function placementLine(placement, perSection = 6) {
  const score = placement?.score
  if (!score || !(perSection > 0)) return null
  const parts = []
  for (const [id, name] of SECTION) {
    const n = score[id]
    if (typeof n !== 'number' || !Number.isFinite(n)) return null
    parts.push(`${name} ${n}/${perSection}`)
  }
  return `Başlangıç testi: ${parts.join(', ')}.`
}

export function placementSummary(placement, perSection = 6) {
  const line = placementLine(placement, perSection)
  const band = { baslangic: 'Başlangıç', orta: 'Orta', ileri: 'İleri' }[placement?.level]
  if (!line || !band || typeof placement.tot !== 'number') {
    return 'Başlangıç testi kayıtlı ama bölüm puanları yok. Güçlü ya da zayıf yan demiyorum.'
  }
  return `${line} Etiket: ${band}, toplam ${placement.tot}. Bu testin bandı; ders cevaplarından ayrı.`
}

/**
 * Yerleşmiş öğrencinin bugünkü adımları. Ön test açıksa dersin önüne konur;
 * vakti gelen tekrar ondan da önce gelir.
 */
export function buildPlan({ state, due, nextDay, weekly, unitDone, now, preAvail = false, unitNo = state.unit }) {
  if (!state.placement) return []
  const away = daysAway(state.daily || {}, now)
  if (preAvail) {
    const review = coachPlan({ state, due, nextDay: null, weekly: false, unitDone: false, away, now })
      .filter(s => s.key === 'review')
    return [...review, {
      key: 'pre', action: 'pre', done: false,
      title: `Ünite ${unitNo} ön testi`,
      note: '10 soru: ünite sonunda farkı bununla göreceğiz.',
    }]
  }
  return coachPlan({ state, due, nextDay, weekly, unitDone, away, now })
}

export function coachLead({ away, title }) {
  if (away != null && away >= 2) return `${away} gündür ara verdin, sorun değil. Kaldığın yer duruyor.`
  if (!title) return 'Bugünkü plan bitti.'
  return `Bugünkü iş: ${title}.`
}

/** Bugünkü tek iş ve kısa gerekçe. Gerekçe sayılardan gelir; kanıt yoksa bunu söyler. */
export function todayGoal({ steps, away, due = 0, placement, studied: hasRecord = false, perSection = 6 }) {
  const open = steps.find(s => !s.done) || null
  if (!open) return { title: 'Bugünkü plan bitti', why: 'Açık adım kalmadı. Kayıtlar duruyor.', step: null }
  const waiting = Math.max(due, 0)
  const asked = Math.min(waiting, REVIEW_CAP)
  const placed = placementLine(placement, perSection)
  let why
  if (open.key === 'review') {
    const gap = away != null && away >= 2 ? `${away} gündür ara verdin. İlerleme silinmedi. ` : ''
    const howMany = waiting > REVIEW_CAP
      ? `Bugün ${asked} tanesi sorulur; kalan ${waiting - asked} sonraki oturuma kalır.`
      : `Bugün ${asked} tanesi sorulur.`
    why = `${gap}Takviminde vakti gelen ${waiting} ifade var. ${howMany} Aralıklar önceki cevaplarından gelir.`
  } else if (open.key === 'pre') {
    why = `${placed ? `${placed} ` : ''}Bu ünitede ders kaydı yok. Bugünkü iş 10 soruluk giriş ölçümü; ünite sonundaki sayıyla kıyaslanır. Bu bir yeterlilik iddiası değil.`
  } else if (open.key === 'lesson' && !hasRecord) {
    why = placed
      ? `${placed} Henüz ders kaydı yok, o yüzden güçlü ya da zayıf yan demiyorum. Bugünkü iş ilk ders.`
      : 'Henüz ders kaydı yok. Bugünkü iş ilk ders.'
  } else if (open.key === 'lesson' && away != null && away >= 2) {
    why = `${away} gündür ara verdin. Bekleyen tekrar yok. Kaldığın dersten devam; günler silinmedi.`
  } else if (open.key === 'lesson') {
    why = 'Vakti gelen tekrar yok. Sırada yeni ders var.'
  } else if (open.key === 'post') {
    why = 'Bu ünitenin ders günleri kayıtlı. Son test, giriş varsa onunla kıyaslanır.'
  } else {
    why = open.note || 'Bu adım bugünkü plandan.'
  }
  return { title: open.title, why, step: open }
}

const CTA = {
  review: 'Tekrara başla',
  lesson: 'Derse başla',
  pre: 'Giriş ölçümüne başla',
  post: 'Son teste başla',
  weekly: 'Quiz’e başla',
  mini: 'Mini LGS’ye başla',
  repair: 'Tamir setine başla',
}
export const stepCta = step => (step && CTA[step.key]) || 'Başla'

/**
 * Bu oturumun sayımı ve sıradaki plan adımı.
 * total < 3 ise yargı yok. missed yalnız bu oturumda ilk denemede kaçan görünen adlar.
 */
export function sessionWrap({ first = 0, total = 0, missed = [], nextTitle = null }) {
  const names = missed.filter(Boolean).slice(0, 3)
  let head
  if (!total) head = 'Bu oturumda kayıtlı cevap yok; sonuç çıkaramam.'
  else if (total < MIN_ANSWERS) head = `${first}/${total} ilk denemede doğru. Bu kadar cevapla bir yargıya varmak için erken.`
  else head = `${first}/${total} ilk denemede doğru.`
  const miss = !total ? ''
    : names.length ? ` İlk denemede kaçanlar: ${names.join(', ')}.`
    : ' Bu oturumda ilk denemede kaçan ifade yok.'
  const next = nextTitle ? ` Sıradaki adım: ${nextTitle}.` : ' Bugünkü planda açık adım kalmadı.'
  return { text: head + miss + next, enough: total >= MIN_ANSWERS, nextTitle: nextTitle || null }
}

/** Son 7 günün ders ve tekrar cevapları. 5'ten azsa güçlü/zayıf yan yok. */
export function recentEvidence({ log = [], now, days = RECENT_DAYS }) {
  const from = now - days * DAY_MS
  const rows = (log || []).filter(e => e && e.qid && e.kind !== 'flash' && e.t >= from && e.t <= now)
  if (!rows.length) return null
  if (rows.length < RECENT_MIN) {
    return { enough: false, text: `Son 7 günde ${rows.length} kayıtlı cevap var. Güçlü ya da zayıf yan söylemek için en az ${RECENT_MIN} cevap gerekir.` }
  }
  const ok = rows.filter(e => e.ok).length
  const wrong = {}
  for (const e of rows) {
    if (e.ok) continue
    const u = unitOfItem(e.id)
    if (u) wrong[u] = (wrong[u] || 0) + 1
  }
  const top = Object.entries(wrong).sort((a, b) => b[1] - a[1] || +a[0] - +b[0])[0]
  let text = `Son 7 günde ${rows.length} cevabın ${ok} tanesi doğru.`
  if (top && top[1] >= 3) text += ` Aynı pencerede en çok yanlış Ünite ${top[0]} içinde (${top[1]}). Bu bir tanı değil, sadece sayım.`
  return { enough: true, text }
}

export function learnerView({ state, due, nextDay, weekly, unitDone, now, preAvail = false, perSection = 6 }) {
  const away = daysAway(state.daily || {}, now)
  const steps = buildPlan({ state, due, nextDay, weekly, unitDone, now, preAvail, unitNo: state.unit })
  const hasRecord = studied(state)
  const goal = todayGoal({ steps, away, due, placement: state.placement, studied: hasRecord, perSection })
  const evidence = hasRecord ? recentEvidence({ log: state.progress?.log, now }) : null
  const done = steps.filter(s => s.done).length
  return {
    away, steps, goal, evidence,
    lead: coachLead({ away, title: goal.step ? goal.title : null }),
    stepNo: goal.step ? done + 1 : steps.length,
    stepCount: steps.length,
  }
}
