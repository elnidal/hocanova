import test from 'node:test'
import assert from 'node:assert/strict'
import { firstWeek } from './journey.js'
import { dayStamp } from './goal.js'

const now = new Date(2026, 10, 21, 18).getTime()
const D = 864e5
const base = { placement: { level: 'orta', at: now - 2 * D }, doneDays: {}, daily: {}, progress: { log: [] } }

test('ilk hafta: önce söz, sonra ilk ders; görevler durumdan okunur', () => {
  let j = firstWeek(base, now)
  assert.equal(j.next.key, 'pledge')
  assert.equal(j.doneN, 0)
  j = firstWeek({ ...base, pledge: { perWeek: 5, at: now }, doneDays: { u1d1: { at: now } }, daily: { [dayStamp(now)]: 8 } }, now)
  assert.deepEqual([j.doneN, j.next.key, j.pledge], [2, 'chain2', 5])
  j = firstWeek({ ...base, pledge: { perWeek: 3 }, doneDays: { a: {}, b: {}, c: {} }, daily: { [dayStamp(now)]: 3, [dayStamp(now - D)]: 4 }, progress: { log: [{ kind: 'flash' }] }, examDone: { e1: {} } }, now)
  assert.deepEqual([j.doneN, j.next.key], [6, 'mini'])
})

test('ilk hafta: hepsi bitince ya da 14 gün geçince görünmez; testsiz öğrencide yok', () => {
  const all = { ...base, pledge: { perWeek: 7 }, doneDays: { a: {}, b: {}, c: {} }, daily: { x: 1, y: 2 }, progress: { log: [{ kind: 'flash' }] }, examDone: { e: {} }, miniLgs: [{ net: 5 }] }
  assert.equal(firstWeek(all, now), null)
  assert.equal(firstWeek({ ...base, placement: { at: now - 15 * D } }, now), null)
  assert.equal(firstWeek({ ...base, placement: null }, now), null)
})
