import test from 'node:test'
import assert from 'node:assert/strict'
import { examReady, examQuestions } from './exam.js'

test('Sınav Dili: önerilen noktaya gelindi mi', () => {
  const units = [{ unit: 1, dayCount: 3 }]
  assert.equal(examReady({ unit: 1, day: 3 }, { u1d1: {}, u1d2: {} }, units), false)
  assert.equal(examReady({ unit: 1, day: 3 }, { u1d3: {} }, units), true)
  assert.equal(examReady({ unit: 1, day: null }, { u1d1: {}, u1d2: {} }, units), false)
  assert.equal(examReady({ unit: 1, day: null }, { u1d1: {}, u1d2: {}, u1d3: {} }, units), true)
  assert.equal(examReady(null, {}, units), true)
})

test('Sınav Dili soruları uygulama biçimine çevrilir', () => {
  const [q] = examQuestions({ practice: [{ id: 'x', context: 'A: hi\nB: ____', explain_tr: 'çünkü', options: ['a', 'b'], answer: 0 }] })
  assert.equal(q.stem, 'A: hi\nB: ____'); assert.equal(q.explain, 'çünkü')
})
