import test from 'node:test'
import assert from 'node:assert/strict'
import { stemCounts, stemAccuracy, pickStem, weakStems, stemName } from './stems.js'
import { scoreMini } from './lgsMini.js'

const q = (id, stem, unit, role = 'sina') => ({ id, stem_id: stem, unit, role, lgs_like: true, options: ['a', 'b', 'c', 'd'] })
const idx = new Map([
  ['U1-001', [q('a1', 'S01', 1), q('a2', 'S06', 1, 'review'), { id: 'a3', role: 'kullan', options: ['x', 'y', 'z'] }]],
  ['U2-001', [q('b1', 'S06', 2)]],
  ['U3-001', [q('c1', 'S06', 3), q('c2', 'S06', 3)]],
])

test('soru tipleri: sayım, doğru oranı, tipe göre seçim', () => {
  assert.deepEqual(stemCounts(idx), { S01: 1, S06: 4 })
  assert.deepEqual(stemAccuracy(idx, [{ qid: 'a2', ok: true }, { qid: 'b1', ok: false }, { qid: 'a3', ok: true }, { qid: null }]), { S06: { ok: 1, n: 2 } })
  const p = pickStem(idx, 'S06', [1, 2], { rng: () => 0 })
  assert.deepEqual(p.map(x => x.itemId).sort(), ['U1-001', 'U2-001'])
  assert.equal(pickStem(idx, 'S06').length, 3) // ifade başına bir soru
  assert.equal(stemName('S06'), 'Tablo ve grafik okuma')
})

test('Mini LGS tipe göre kayıp', () => {
  const list = [{ id: 'a1', itemId: 'U1-001', stem_id: 'S01', correctIndex: 0 }, { id: 'b1', itemId: 'U2-001', stem_id: 'S06', correctIndex: 0 }, { id: 'c1', itemId: 'U3-001', stem_id: 'S06', correctIndex: 0 }, { id: 'x', itemId: 'U3-002', correctIndex: 0 }]
  const r = scoreMini(list, { a1: 0, b1: 2, c1: -1, x: 1 })
  assert.deepEqual(r.byStem, { S01: { d: 1, y: 0, b: 0 }, S06: { d: 0, y: 1, b: 1 }, 'diğer': { d: 0, y: 1, b: 0 } })
  assert.deepEqual(weakStems(r.byStem), ['S06'])
})
