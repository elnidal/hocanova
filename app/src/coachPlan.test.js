import test from 'node:test'
import assert from 'node:assert/strict'
import { coachPlan, planHeadline, daysToLgs, LGS_DATE } from './coachPlan.js'

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
