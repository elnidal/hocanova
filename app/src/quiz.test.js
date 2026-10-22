import test from 'node:test'
import assert from 'node:assert/strict'
import { pickQuiz, preQuiz, postQuiz, weeklyItems, weekKey, weeklyDue, pct } from './quiz.js'
import { mulberry32, createProgress, recordAnswer } from './engine/index.js'

const q = (id, role, extra = {}) => ({ id, role, options: ['a', 'b', 'c', 'd'], answer: 0, ...extra })
const idx = new Map([
  ['a', [q('a-k', 'kullan'), q('a-s', 'sina', { lgs_like: true }), q('a-z', 'sezdir')]],
  ['b', [q('b-k', 'kullan'), q('b-s', 'sina')]],
  ['c', [q('c-z', 'sezdir')]],
])

test('ön test kullan sorularını, son test LGS sorularını seçer; son testte ön testin soruları çıkmaz', () => {
  const unit = { items: [{ id: 'a' }, { id: 'b' }, { id: 'c' }], days: [{ new_items: ['a', 'b', 'c'] }] }
  const pre = preQuiz(idx, unit, mulberry32(1))
  assert.deepEqual(pre.map(x => x.id).sort(), ['a-k', 'b-k']) // c'nin uygun sorusu yok
  const post = postQuiz(idx, unit, pre.map(x => x.id), mulberry32(2))
  assert.deepEqual(post.map(x => x.id).sort(), ['a-s', 'b-s'])
  assert.ok(post.every(x => !pre.some(p => p.id === x.id)))
  assert.equal(pickQuiz(idx, ['a', 'b'], { n: 1, rng: mulberry32(3) }).length, 1)
})

test('haftalık quiz: son 7 günün öğrenilmiş ifadeleri, cuma–pazar ve haftada bir', () => {
  const fri = new Date(2026, 9, 23, 12).getTime() // Cuma
  let p = createProgress()
  for (const [i, id] of ['a', 'b', 'c', 'd', 'e', 'f'].entries()) p = recordAnswer(p, { itemId: id, qid: id, correct: true, now: fri - i * 864e5 })
  p = recordAnswer(p, { itemId: 'old', qid: 'old', correct: true, now: fri - 10 * 864e5 })
  assert.deepEqual(weeklyItems(p, fri).sort(), ['a', 'b', 'c', 'd', 'e', 'f'])
  assert.equal(weekKey(fri), '2026-10-19')
  assert.equal(weeklyDue(p, {}, fri), true)
  assert.equal(weeklyDue(p, { '2026-10-19': { ok: 1, n: 1 } }, fri), false)
  assert.equal(weeklyDue(p, {}, fri - 2 * 864e5), false) // çarşamba
  assert.equal(pct({ ok: 3, n: 4 }), 75); assert.equal(pct(null), null)
})
