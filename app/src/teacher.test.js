import test from 'node:test'
import assert from 'node:assert/strict'
import { daysSince, status, classSummary, sortStudents } from './teacher.js'

const now = new Date('2026-10-23T12:00:00Z').getTime()
const s = (name, cevap, iso) => ({ takma_ad: name, cevap, son_islem: iso })

test('öğretmen paneli: durum, özet ve sıralama', () => {
  const list = [s('a', 50, '2026-10-23T08:00:00Z'), s('b', 20, '2026-10-22T09:00:00Z'), s('c', 30, '2026-10-18T09:00:00Z'), s('d', 0, '2026-10-20T09:00:00Z')]
  assert.equal(daysSince('2026-10-20T12:00:00Z', now), 3)
  assert.deepEqual(list.map(x => status(x, now)), ['today', 'recent', 'away', 'never'])
  assert.deepEqual(classSummary(list, now), { total: 4, today: 1, recent: 1, away: 1, never: 1 })
  assert.deepEqual(sortStudents(list, now).map(x => x.takma_ad), ['c', 'd', 'b', 'a'])
})
