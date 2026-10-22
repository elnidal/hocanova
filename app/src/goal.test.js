import test from 'node:test'
import assert from 'node:assert/strict'
import { countAnswer, todayCount, parseAssignment, buildWordList, dayStamp } from './goal.js'

test('günlük sayaç gün gün artar ve 60 günle sınırlıdır', () => {
  const t = new Date(2026, 9, 22, 10).getTime()
  let d = {}
  for (let i = 0; i < 3; i++) d = countAnswer(d, t)
  assert.equal(todayCount(d, t), 3)
  assert.equal(todayCount(d, t + 86400000), 0)
  let many = {}
  for (let i = 0; i < 70; i++) many = countAnswer(many, t + i * 86400000)
  assert.equal(Object.keys(many).length, 60)
  assert.equal(dayStamp(t), '2026-10-22')
})

test('öğretmen ödev bağlantısı', () => {
  assert.deepEqual(parseAssignment('?odev=100&not=Bug%C3%BCn%20100%20soru'), { target: 100, note: 'Bugün 100 soru' })
  assert.deepEqual(parseAssignment('?odev=30'), { target: 30, note: null })
  assert.equal(parseAssignment('?odev=2'), null)
  assert.equal(parseAssignment('?odev=abc'), null)
  assert.equal(parseAssignment(''), null)
})

test('kelime listesi: ilk N gün ve tüm ünite', () => {
  const unit = {
    items: [{ id: 'a', display: 'A', meaning_tr: 'a1' }, { id: 'b', display: 'B', meaning_tr: 'b1', trap_note: 'n' }, { id: 'c', display: 'C', meaning_tr: 'c1' }],
    days: [{ day: 2, title: 'iki', new_items: ['b'] }, { day: 1, title: 'bir', new_items: ['a'] }],
  }
  const first = buildWordList(unit, 1)
  assert.equal(first.length, 1); assert.equal(first[0].rows[0].display, 'A')
  const all = buildWordList(unit)
  assert.deepEqual(all.map(g => g.title), ['Gün 1 · bir', 'Gün 2 · iki', 'Diğer ifadeler'])
  assert.equal(all[1].rows[0].note, 'n')
})
