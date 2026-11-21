import test from 'node:test'
import assert from 'node:assert/strict'
import { chainView } from './chain.js'

const at = s => new Date(s + 'T15:00:00').getTime()
const d = (...days) => Object.fromEntries(days.map(x => [x, 3]))

test('zincir: 4 hafta pazartesiden başlar, bugün ve gelecek işaretli', () => {
  const v = chainView(d('2026-11-18', '2026-11-19', '2026-11-20'), at('2026-11-20')) // cuma
  assert.equal(v.rows.length, 4)
  assert.equal(v.rows[3][0].stamp, '2026-11-16')
  assert.equal(v.rows[0][0].stamp, '2026-10-26')
  assert.deepEqual(v.rows[3].slice(2, 7).map(c => [c.on, c.today, c.future]), [[true, false, false], [true, false, false], [true, true, false], [false, false, true], [false, false, true]])
  assert.equal(v.streak, 3)
  assert.match(v.text, /3 günlük zincir · en uzun zincirin bu!/)
})

test('zincir: Nova izni halkası, en uzun zincir, kilometre taşı, kopunca suçlamadan yeni başlangıç', () => {
  const v = chainView(d('2026-11-16', '2026-11-17', '2026-11-19', '2026-11-20'), at('2026-11-20'), { best: 9 })
  assert.equal(v.rows[3][2].saved, true)
  assert.match(v.text, /4 günlük zincir · en uzun 9/)
  const seven = d('2026-11-14', '2026-11-15', '2026-11-16', '2026-11-17', '2026-11-18', '2026-11-19', '2026-11-20')
  assert.equal(chainView(seven, at('2026-11-20')).milestone, 7)
  const broken = chainView(d('2026-11-10', '2026-11-11'), at('2026-11-20'), { best: 12 })
  assert.equal(broken.streak, 0)
  assert.match(broken.text, /Yeni zincir bugün başlıyor\. En uzun zincirin 12 gün/)
  assert.ok(!/kaybett|kırdın|yazık/i.test(broken.text))
  assert.match(chainView({}, at('2026-11-20')).text, /ilk halkası/)
})
