import test from 'node:test'
import assert from 'node:assert/strict'
import { apply, hydrate, initial } from './state.js'
import { buildPlan } from './sessionCoach.js'

const placement = { level: 'orta', tot: 12, focus: 'B', score: { A: 4, B: 4, C: 4 } }

test('eski kayıt yerleşimi ve biten günü korur; eksik alanlar varsayılan olur', () => {
  const old = { placement, unit: 3, doneDays: { u1d1: { first: 4, total: 5, n: 2, at: 10 } }, progress: { level: 'orta', items: { 'U1-001': { status: 'unc', wrong: 1 } }, log: [] } }
  const s = hydrate(old)
  assert.equal(s.placement.level, 'orta')
  assert.equal(s.doneDays.u1d1.total, 5)
  assert.equal(s.unit, 3)
  assert.equal(s.progress.items['U1-001'].wrong, 1)
  assert.equal(s.goal.target, initial().goal.target)
  assert.deepEqual(s.daily, {})
})

test('ders ve cevap, yerleşimi ve önceki günü silmez', () => {
  let s = hydrate({ placement, doneDays: { u1d1: { first: 3, total: 4, n: 2, at: 2 } }, unit: 1 })
  s = apply(s, { type: 'answer', payload: { itemId: 'U1-009', qid: 'q1', correct: false, kind: 'lesson', now: 3 } })
  s = apply(s, { type: 'dayDone', key: 'u1d2', first: 1, total: 2, n: 1, now: 4 })
  s = apply(s, { type: 'reviewDone', first: 2, total: 3, now: 5 })
  assert.equal(s.placement.tot, 12)
  assert.equal(s.doneDays.u1d1.first, 3)
  assert.equal(s.doneDays.u1d2.total, 2)
  assert.equal(s.progress.items['U1-009'].wrong, 1)
  assert.equal(s.reviews.length, 1)
  assert.equal(s.unit, 1)
})

test('sıfırlama bilinçli; sıradan cevap sıfırlamaz', () => {
  let s = hydrate({ placement, doneDays: { u1d1: { at: 1 } } })
  s = apply(s, { type: 'examQ', now: 9 })
  assert.ok(s.placement)
  assert.ok(s.doneDays.u1d1)
  const blank = apply(s, { type: 'reset' })
  assert.equal(blank.placement, null)
  assert.deepEqual(blank.doneDays, {})
})

test('alanı eksik eski kayıt da planlanır', () => {
  const saved = hydrate({ placement, unit: 1 })
  const steps = buildPlan({ state: saved, due: 0, nextDay: { day: 1 }, weekly: false, unitDone: false, now: 20, preAvail: true })
  assert.equal(steps[0].key, 'pre')
  assert.equal(saved.placement.level, 'orta')
})
