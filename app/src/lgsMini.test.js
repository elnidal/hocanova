import test from 'node:test'
import assert from 'node:assert/strict'
import { pickMini, netOf, fmtNet, scoreMini, weakUnits, pickRepair, unitOfItem, miniTrend } from './lgsMini.js'
import { mulberry32 } from './engine/index.js'

const q = (id, role, extra = {}) => ({ id, role, options: ['a', 'b', 'c', 'd'], answer: 0, ...extra })
const idx = new Map()
for (const u of [1, 2, 3]) for (let k = 1; k <= 6; k++) {
  const id = `U${u}-00${k}`
  idx.set(id, [q(`${id}-s`, 'sina', { lgs_like: true }), q(`${id}-k`, 'kullan'), q(`${id}-z`, 'sezdir')])
}

test('ünite kimlikten okunur', () => {
  assert.equal(unitOfItem('U10-004'), 10)
  assert.equal(unitOfItem('x'), null)
})

test('mini LGS: seçilen ünitelerden dengeli 10 sına sorusu, ifade tekrar etmez', () => {
  const list = pickMini(idx, [1, 2], { rng: mulberry32(1) })
  assert.equal(list.length, 10)
  assert.ok(list.every(x => x.role === 'sina'))
  assert.equal(new Set(list.map(x => x.itemId)).size, 10)
  const u1 = list.filter(x => unitOfItem(x.itemId) === 1).length
  assert.equal(u1, 5)
  assert.ok(list.every(x => unitOfItem(x.itemId) !== 3))
})

test('mini LGS: önceki soruları önce dışarıda bırakır, yetmezse kullanır', () => {
  const first = pickMini(idx, [1], { n: 4, rng: mulberry32(2) })
  const second = pickMini(idx, [1], { n: 4, exclude: new Set(first.map(x => x.id)), rng: mulberry32(3) })
  assert.equal(second.filter(x => first.some(f => f.id === x.id)).length, 2) // 6 ifadenin 4'ü kullanılmıştı
  assert.equal(second.length, 4)
})

test('net: 3 yanlış 1 doğruyu götürür', () => {
  assert.equal(netOf(8, 2), 7.33)
  assert.equal(netOf(10, 0), 10)
  assert.equal(netOf(3, 3), 2)
  assert.equal(fmtNet(7.33), '7,33')
})

test('puanlama: doğru/yanlış/boş ve ünite dökümü', () => {
  const list = [
    { id: 'a', itemId: 'U1-001', correctIndex: 0 },
    { id: 'b', itemId: 'U1-002', correctIndex: 1 },
    { id: 'c', itemId: 'U2-001', correctIndex: 2 },
    { id: 'd', itemId: 'U2-002', correctIndex: 3 },
  ]
  const r = scoreMini(list, { a: 0, b: 0, c: -1 })
  assert.deepEqual({ d: r.d, y: r.y, b: r.b, net: r.net }, { d: 1, y: 1, b: 2, net: 0.67 })
  assert.deepEqual(r.byUnit, { 1: { d: 1, y: 1, b: 0 }, 2: { d: 0, y: 0, b: 2 } })
  assert.deepEqual(weakUnits(r.byUnit), [1, 2])
  assert.deepEqual(weakUnits({ 1: { d: 2, y: 0, b: 0 } }), [])
})

test('tamir seti: ünite başına 5 ifade, önce yanlış yapılanlar', () => {
  const progress = { items: { 'U2-006': { status: 'unc', wrong: 2 }, 'U2-005': { status: 'known', wrong: 0 } } }
  const set = pickRepair(idx, [2, 3], progress, { rng: mulberry32(4) })
  assert.equal(set.length, 10)
  assert.equal(set[0].itemId, 'U2-006')
  assert.ok(!set.slice(0, 5).some(e => e.itemId === 'U2-005'))
  assert.ok(set.every(e => e.q.role === 'kullan')) // review yok; kullan sezdirden önce
})

test('trend: son net ve fark', () => {
  assert.equal(miniTrend([]), null)
  assert.deepEqual(miniTrend([{ net: 5 }, { net: 6.67 }]), { last: 6.67, diff: 1.67, count: 2 })
})
