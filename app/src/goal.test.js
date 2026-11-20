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

import { streakInfo, novaPassUsed } from './goal.js'
test('Nova izni: haftada bir boş gün seriyi bozmaz, iki boş gün bozar', () => {
  const at = s => new Date(s + 'T15:00:00').getTime()
  const d = (...days) => Object.fromEntries(days.map(x => [x, 5]))
  // 20 Kasım 2026 cuma. 18 Kasım boş: izinle köprü
  assert.deepEqual(streakInfo(d('2026-11-16', '2026-11-17', '2026-11-19', '2026-11-20'), at('2026-11-20')), { n: 4, saved: ['2026-11-18'] })
  // aynı haftada ikinci boş gün köprülenmez: 19 izinle geçilir, 17'de zincir biter (20 ve 18)
  assert.deepEqual(streakInfo(d('2026-11-16', '2026-11-18', '2026-11-20'), at('2026-11-20')), { n: 2, saved: ['2026-11-19'] })
  // iki boş gün üst üste: bozulur
  assert.equal(streakInfo(d('2026-11-16', '2026-11-19', '2026-11-20'), at('2026-11-20')).n, 2)
  // farklı haftalarda birer izin
  assert.deepEqual(streakInfo(d('2026-11-13', '2026-11-15', '2026-11-16', '2026-11-18'), at('2026-11-18')).saved, ['2026-11-17', '2026-11-14'])
  // bugün henüz çalışılmadı: dünden sayar, bugün izin harcanmaz
  assert.deepEqual(streakInfo(d('2026-11-18', '2026-11-19'), at('2026-11-20')), { n: 2, saved: [] })
  // dün boş, bugün de henüz yok: dün izinle köprülenir
  assert.deepEqual(streakInfo(d('2026-11-17', '2026-11-18'), at('2026-11-20')), { n: 2, saved: ['2026-11-19'] })
  assert.equal(novaPassUsed(d('2026-11-17', '2026-11-18'), at('2026-11-20')), true)
  assert.equal(novaPassUsed(d('2026-11-19', '2026-11-20'), at('2026-11-20')), false)
  assert.deepEqual(streakInfo({}, at('2026-11-20')), { n: 0, saved: [] })
})
