import test from 'node:test'
import assert from 'node:assert/strict'
import { coachPlan, planHeadline, daysToLgs, LGS_DATE, pacePlan, paceText } from './coachPlan.js'

const now = new Date(2026, 10, 2, 18).getTime() // 2 Kasım 2026 akşam
const H = 36e5
const base = { doneDays: {}, reviews: [], miniLgs: [], repairs: [] }

test('LGS geri sayımı', () => {
  assert.equal(daysToLgs(LGS_DATE + 1), 0)
  assert.equal(daysToLgs(new Date(2026, 10, 1, 10).getTime()), 224)
  assert.equal(daysToLgs(new Date(2027, 5, 12, 20).getTime()), 1)
})

test('yeni öğrenci: yalnız ders adımı', () => {
  const s = coachPlan({ state: base, due: 0, nextDay: { day: 1 }, weekly: false, unitDone: false, now })
  assert.deepEqual(s.map(x => x.key), ['lesson'])
  assert.equal(s[0].done, false)
})

test('tekrar önce gelir; ders bugün yapıldıysa işaretli', () => {
  const state = { ...base, doneDays: { u1d1: { at: now - 2 * H } } }
  const s = coachPlan({ state, due: 4, nextDay: { day: 2 }, weekly: false, unitDone: false, now })
  assert.deepEqual(s.map(x => [x.key, x.done]), [['review', false], ['lesson', true]])
})

test('3 dersten sonra haftalık Mini LGS; kayıp varsa tamir', () => {
  const doneDays = { a: { at: now - 72 * H }, b: { at: now - 48 * H }, c: { at: now - 30 * H } }
  let s = coachPlan({ state: { ...base, doneDays }, due: 0, nextDay: { day: 4 }, weekly: false, unitDone: false, now })
  assert.deepEqual(s.map(x => x.key), ['lesson', 'mini'])
  const mini = { now: now - H, net: 6.67, byUnit: { 1: { d: 3, y: 2, b: 0 }, 2: { d: 4, y: 0, b: 1 } } }
  s = coachPlan({ state: { ...base, doneDays, miniLgs: [mini] }, due: 0, nextDay: { day: 4 }, weekly: false, unitDone: false, now })
  assert.deepEqual(s.map(x => [x.key, x.done]), [['lesson', false], ['mini', true], ['repair', false]])
  assert.deepEqual(s[2].units, [1, 2])
  // tamir yapıldı (bugün): işaretli kalır
  s = coachPlan({ state: { ...base, doneDays, miniLgs: [mini], repairs: [{ at: now }] }, due: 0, nextDay: { day: 4 }, weekly: false, unitDone: false, now })
  assert.equal(s.find(x => x.key === 'repair').done, true)
  // ertesi hafta: eski deneme planda görünmez, yenisi istenir
  s = coachPlan({ state: { ...base, doneDays, miniLgs: [{ ...mini, now: now - 8 * 24 * H }], repairs: [{ at: now - 7.5 * 24 * H }] }, due: 0, nextDay: { day: 4 }, weekly: false, unitDone: false, now })
  assert.deepEqual(s.map(x => [x.key, x.done]), [['lesson', false], ['mini', false]])
})

test('ünite bittiyse son test; başlık kalan adımı söyler', () => {
  const s = coachPlan({ state: base, due: 0, nextDay: null, weekly: true, unitDone: true, now })
  assert.deepEqual(s.map(x => x.key), ['post', 'weekly'])
  assert.match(planHeadline(s, 200), /2 adım/)
  assert.match(planHeadline([{ done: true }], 200), /bitirdin/)
})

test('tempo: yeni öğrenci için haftalık hedef ve bitiş tarihi', () => {
  const t = new Date(2026, 10, 5, 12).getTime() // Perşembe; hafta başı 2 Kasım
  const p = pacePlan({ totalLessons: 116, doneDays: {}, now: t })
  assert.equal(p.mode, 'pace')
  assert.equal(p.target, 5)
  assert.equal(p.weekDone, 0)
  assert.equal(p.raised, null)
  assert.match(paceText(p), /Nisan ortasında biter/)
})

test('tempo: hafta içinde hedef sabit kalır, hedef dolunca kutlar', () => {
  const t = new Date(2026, 10, 5, 12).getTime()
  const done = {}
  for (let i = 0; i < 5; i++) done[`d${i}`] = { at: new Date(2026, 10, 2 + (i % 3), 10).getTime() }
  const p = pacePlan({ totalLessons: 116, doneDays: done, now: t })
  assert.equal(p.target, 5)
  assert.equal(p.weekDone, 5)
  assert.equal(p.left, 111)
  assert.match(paceText(p), /hedefi tamam/)
})

test('tempo: ara verince yeni tempo söylenir, suçlama yok', () => {
  const t = new Date(2027, 1, 3, 12).getTime() // Şubat: 2 ders yapılmış, uzun ara
  const done = { a: { at: new Date(2026, 10, 3).getTime() }, b: { at: new Date(2026, 10, 4).getTime() } }
  const p = pacePlan({ totalLessons: 116, doneDays: done, now: t })
  assert.ok(p.tight || p.raised || p.target >= 7)
  assert.ok(!/geride|geç kaldın|yetersiz/i.test(paceText(p)))
})

test('tempo: artış, bitiş, yoğun tempo ve son 30 gün', () => {
  const a = { x: { at: new Date(2026, 9, 1).getTime() } }
  const raised = pacePlan({ totalLessons: 116, doneDays: a, now: new Date(2026, 11, 9, 12).getTime() })
  assert.deepEqual([raised.target, raised.raised], [6, 5])
  assert.match(paceText(raised), /5 dersten 6 derse/)
  const same = pacePlan({ totalLessons: 116, doneDays: a, now: new Date(2026, 11, 30).getTime() })
  assert.equal(same.raised, null)
  const tight = pacePlan({ totalLessons: 116, doneDays: a, now: new Date(2027, 2, 31, 12).getTime() })
  assert.deepEqual([tight.target, tight.tight], [7, true])
  assert.equal(pacePlan({ totalLessons: 2, doneDays: { a: { at: 1 }, b: { at: 2 } }, now: new Date(2026, 10, 5).getTime() }).mode, 'complete')
  const r = pacePlan({ totalLessons: 50, doneDays: {}, now: new Date(2027, 4, 20).getTime() })
  assert.equal(r.mode, 'final')
  assert.match(paceText(r), /Son düzlük/)
})
