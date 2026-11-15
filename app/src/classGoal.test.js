import test from 'node:test'
import assert from 'node:assert/strict'
import { classView } from './classGoal.js'

const base = { name: '8A', goal: 1000, total: 420, members: 20, top: [{ nick: 'Ece', n: 90 }, { nick: 'Kaan', n: 70 }, { nick: 'Duru', n: 60 }, { nick: 'X', n: 1 }] }

test('sınıf hedefi: ilerleme ve ilk 3', () => {
  const v = classView({ ...base, me: { rank: 2, n: 70 } })
  assert.equal(v.pct, 42)
  assert.match(v.head, /420 \/ 1000 soru · hedefe 580 kaldı/)
  assert.equal(v.top.length, 3)
  assert.match(v.mine, /2\. sıradasın/)
})

test('sınıf hedefi: alt yarıda sıra yazılmaz, hiç çözmeyene suçlama yok', () => {
  assert.ok(!/sıradasın/.test(classView({ ...base, me: { rank: 18, n: 3 } }).mine))
  assert.match(classView({ ...base, me: { rank: 20, n: 0 } }).mine, /henüz soru çözmedin/)
  assert.match(classView({ ...base, total: 1200, me: null }).head, /Hedef tamam/)
  assert.equal(classView({ ...base, total: 1200 }).pct, 100)
  assert.equal(classView(null), null)
})
