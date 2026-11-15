import test from 'node:test'
import assert from 'node:assert/strict'
import { buildPlan, todayGoal, sessionWrap, placementLine, placementSummary, recentEvidence, coachLead } from './sessionCoach.js'
import { coachPlan } from './coachPlan.js'

const now = new Date(2026, 10, 9, 18).getTime()
const H = 36e5
const base = { doneDays: {}, reviews: [], miniLgs: [], repairs: [], daily: {}, unit: 1, progress: { log: [], items: {} } }
const placed = { ...base, placement: { level: 'orta', tot: 12, focus: 'B', score: { A: 5, B: 3, C: 4 } } }

test('yeni yerleşmiş öğrenci: bugünkü iş ön test, puanlar gerekçede', () => {
  const steps = buildPlan({ state: placed, due: 0, nextDay: { day: 1 }, weekly: false, unitDone: false, now, preAvail: true })
  assert.deepEqual(steps.map(s => s.key), ['pre'])
  const goal = todayGoal({ steps, away: null, due: 0, placement: placed.placement, studied: false })
  assert.equal(goal.title, 'Ünite 1 ön testi')
  assert.match(goal.why, /kelime tanıma 5\/6/)
  assert.match(goal.why, /bağlam 3\/6/)
  assert.match(goal.why, /sınavda kullanma 4\/6/)
  assert.match(goal.why, /yeterlilik iddiası değil/)
  assert.doesNotMatch(goal.why, /çok iyi|biliyorsun|ustalaş/)
})

test('vakti gelen tekrar, yeni dersten önce gelir', () => {
  const state = { ...placed, doneDays: { u1d1: { at: now - 48 * H } }, unitQuiz: { 1: { preSkipped: { now: 1 } } } }
  const steps = buildPlan({ state, due: 4, nextDay: { day: 2 }, weekly: false, unitDone: false, now, preAvail: false })
  assert.equal(steps[0].key, 'review')
  const goal = todayGoal({ steps, away: 2, due: 4, placement: state.placement, studied: true })
  assert.match(goal.title, /4 ifadeyi tekrar/)
  assert.match(goal.why, /vakti gelen 4/)
  assert.match(goal.why, /Bugün 4 tanesi sorulur/)
  const many = todayGoal({ steps, away: null, due: 14, placement: state.placement, studied: true })
  assert.match(many.why, /Bugün 10 tanesi sorulur/)
  assert.match(many.why, /kalan 4/)
  assert.match(goal.why, /silinmedi/)
})

test('iki günden uzun ara deneme ve tamiri bugünden çıkarır, kaydı silmez', () => {
  const doneDays = { a: { at: now - 96 * H }, b: { at: now - 80 * H }, c: { at: now - 72 * H } }
  const mini = { now: now - 8 * 24 * H, net: 4, byUnit: { 1: { d: 1, y: 3, b: 0 } } }
  const state = { ...placed, doneDays, miniLgs: [mini] }
  const full = coachPlan({ state, due: 2, nextDay: { day: 4 }, weekly: true, unitDone: false, now })
  assert.ok(full.some(s => s.key === 'mini'))
  const today = coachPlan({ state, due: 2, nextDay: { day: 4 }, weekly: true, unitDone: false, now, away: 3 })
  assert.deepEqual(today.map(s => s.key), ['review', 'lesson'])
  assert.equal(state.miniLgs.length, 1)
  assert.equal(coachPlan({ state, due: 2, nextDay: { day: 4 }, weekly: true, unitDone: false, now, away: 1 }).some(s => s.key === 'weekly'), true)
})

test('ara verip bekleyen tekrarı olmayan öğrenci kaldığı derse döner', () => {
  const state = { ...placed, doneDays: { u1d1: { at: now - 5 * 24 * H } }, daily: { '2026-11-04': 3 } }
  const steps = buildPlan({ state, due: 0, nextDay: { day: 2 }, weekly: false, unitDone: false, now })
  assert.deepEqual(steps.map(s => s.key), ['lesson'])
  const goal = todayGoal({ steps, away: 5, due: 0, placement: state.placement, studied: true })
  assert.match(goal.why, /5 gündür ara verdin/)
  assert.match(goal.why, /silinmedi/)
  assert.match(coachLead({ away: 5, title: goal.title }), /sorun değil/)
})

test('oturum sonu: kanıt yok, az cevap ve sıradaki adım', () => {
  assert.match(sessionWrap({ first: 0, total: 0, missed: [], nextTitle: 'Gün 1 dersini yap' }).text, /sonuç çıkaramam/)
  const thin = sessionWrap({ first: 1, total: 2, missed: ['busy'], nextTitle: null })
  assert.match(thin.text, /1\/2/)
  assert.match(thin.text, /erken/)
  assert.equal(thin.enough, false)
  const done = sessionWrap({ first: 7, total: 10, missed: ['busy', 'honest'], nextTitle: 'Gün 2 dersini yap' })
  assert.match(done.text, /7\/10 ilk denemede doğru/)
  assert.match(done.text, /busy, honest/)
  assert.match(done.text, /Sıradaki adım: Gün 2 dersini yap/)
  assert.doesNotMatch(done.text, /ustalaş|artık senin|çok iyi|zayıf yanın/)
})

test('bölüm puanı eksikse cümle kurulmaz', () => {
  assert.equal(placementLine({ score: { A: 1, B: 2 } }), null)
  assert.match(placementSummary({ level: 'orta', score: { A: 1 } }), /demiyorum/)
})

test('son 7 gün: beşten az cevapta yargı yok, üç yanlış sayım olarak yazılır', () => {
  assert.equal(recentEvidence({ log: [], now }), null)
  const few = recentEvidence({ log: [{ qid: 'a', id: 'U1-001', ok: false, t: now, kind: 'lesson' }], now })
  assert.equal(few.enough, false)
  assert.match(few.text, /en az 5/)
  const log = [
    ...Array.from({ length: 6 }, (_, i) => ({ qid: `ok${i}`, id: 'U1-001', ok: true, t: now - i, kind: 'review' })),
    ...Array.from({ length: 3 }, (_, i) => ({ qid: `no${i}`, id: 'U2-001', ok: false, t: now - i, kind: 'review' })),
    { qid: 'flash', id: 'U2-001', ok: false, t: now, kind: 'flash' },
  ]
  const ev = recentEvidence({ log, now })
  assert.equal(ev.enough, true)
  assert.match(ev.text, /9 cevabın 6 tanesi doğru/)
  assert.match(ev.text, /Ünite 2 içinde \(3\)/)
  assert.match(ev.text, /tanı değil/)
})
