import test from 'node:test'
import assert from 'node:assert/strict'
import { buildReport } from './report.js'
import { streakOf, daysAway, coachMessage, dayStamp } from './goal.js'
import { alternativeQuestion } from './engine/index.js'

const now = new Date(2026, 9, 22, 12).getTime()
const day = n => dayStamp(now - n * 864e5)

test('seri: bugün çalışılmadıysa dünden sayılır; boşlukta kopar', () => {
  assert.equal(streakOf({ [day(0)]: 3, [day(1)]: 1, [day(2)]: 5 }, now), 3)
  assert.equal(streakOf({ [day(1)]: 1, [day(2)]: 5 }, now), 2)
  assert.equal(streakOf({ [day(2)]: 5 }, now), 0)
  assert.equal(daysAway({ [day(3)]: 1 }, now), 3)
  assert.equal(daysAway({}, now), null)
})

test('koç mesajı önceliği', () => {
  const goal = { target: 20 }
  const base = { goal, due: 0, now, fallback: 'F' }
  assert.match(coachMessage({ ...base, daily: { [day(0)]: 25 } }), /hedefi tamamladın/)
  assert.match(coachMessage({ ...base, daily: { [day(0)]: 5 } }), /15 soru kaldı/)
  assert.match(coachMessage({ ...base, daily: { [day(4)]: 5 } }), /4 gündür/)
  assert.match(coachMessage({ ...base, daily: { [day(1)]: 5, [day(2)]: 5 } }), /2 gündür üst üste/)
  assert.match(coachMessage({ ...base, daily: {}, due: 6 }), /6 ifade/)
  assert.equal(coachMessage({ ...base, daily: {} }), 'F')
})

test('veli raporu', () => {
  const items = [{ id: 'a', display: 'A', meaning_tr: 'a' }, { id: 'b', display: 'B', meaning_tr: 'b' }, { id: 'c', display: 'C', meaning_tr: 'c' }]
  const progress = {
    items: { a: { status: 'known', wrong: 3 }, b: { status: 'unc', wrong: 2 } },
    log: [{ t: now - 1000, ok: true }, { t: now - 2000, ok: false }, { t: now - 20 * 864e5, ok: true }],
  }
  const r = buildReport({ progress, daily: { [day(0)]: 4, [day(1)]: 2 }, doneDays: { u1d1: {} }, items, now })
  assert.equal(r.accuracy, 50)
  assert.equal(r.weekTotal, 6); assert.equal(r.activeDays, 2); assert.equal(r.streak, 2)
  assert.deepEqual(r.state, { known: 1, unc: 1, new: 1 })
  assert.deepEqual(r.hardest.map(x => x.display), ['B']) // bilinen kelime "zorlandığı" listesine girmez
})

test('yanlış sonrası farklı soru; kalmadıysa null', () => {
  const idx = new Map([['x', [{ id: 'q1', role: 'kullan' }, { id: 'q2', role: 'sina' }, { id: 'q3', role: 'sezdir' }]]])
  assert.equal(alternativeQuestion(idx, 'x', new Set(['q1']), { rng: () => 0 }).id, 'q2')
  assert.equal(alternativeQuestion(idx, 'x', new Set(['q1', 'q2'])), null)
})
