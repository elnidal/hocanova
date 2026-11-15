import test from 'node:test'
import assert from 'node:assert/strict'
import { parseVisual, visualEligible } from './visual.js'

const q = (stem, extra = {}) => ({ type: 'table_graph', stem_id: 'S06', prompt: '<en>According to the chart…</en>', stem: `<en>${stem}</en>`, ...extra })

test('uygun olmayan kökler metin olarak kalır', () => {
  assert.equal(visualEligible(q('A: ________\nB: Yes.', { type: 'dialogue_complete' })), false)
  assert.equal(visualEligible(q('One line only.')), false)
  assert.equal(visualEligible(q('Kaan: {U3-001|bake}\nElif: x')), false)
  assert.equal(visualEligible({ type: 'situation', prompt: 'Which sentence is correct?', stem: 'a\nb' }), false)
  assert.equal(visualEligible({ type: 'text_infer', prompt: '<en>According to the note…</en>', stem: 'a\nb' }), true)
})

test('grafik: başlık, sayılar, binlik virgülü', () => {
  const v = parseVisual(q('Class 8B: Which invention? (30 students)\nThe internet: 14\nMobile phone: 9\nCar: 2'))
  assert.equal(v.kind, 'chart')
  assert.equal(v.title, 'Class 8B: Which invention? (30 students)')
  assert.deepEqual(v.bars.map(b => b.value), [14, 9, 2])
  assert.equal(parseVisual(q('SUBSCRIBERS\nA ……… 12\nB ……… 3,500\nC ……… 900')).max, 3500)
  assert.equal(parseVisual(q('LEVEL\nJanuary: 80%\nMarch: 60%\nJuly: 15%')).bars[2].text, '15%')
})

test('hizalı tablo ve ✓/✗ çizelgesi', () => {
  const g = parseVisual(q('Bus   Destination   Departure\nA     Bursa         08.00\nB     Ankara        09.00'))
  assert.deepEqual([g.kind, g.head, g.rows[1]], ['grid', ['Bus', 'Destination', 'Departure'], ['B', 'Ankara', '09.00']])
  const c = parseVisual(q('Make the bed: Deniz ✓ · Arda ✗\nVacuum: Deniz ✗ · Arda ✓', { stem_id: 'S08' }))
  assert.deepEqual([c.kind, c.names, c.rows[1]], ['checks', ['Deniz', 'Arda'], ['Vacuum', [false, true]]])
})

test('afiş: başlık, anahtar–değer ve düz satırlar; sayısal olmayan değerler grafik olmaz', () => {
  const v = parseVisual(q('SEA VIEW GUESTHOUSE\nRoom: 50 € per night\nFree bicycles for all guests', { type: 'text_infer', stem_id: 'S03' }))
  assert.deepEqual(v, { kind: 'card', title: 'SEA VIEW GUESTHOUSE', rows: [{ k: 'Room', v: '50 € per night' }, { t: 'Free bicycles for all guests' }] })
  assert.equal(parseVisual(q('CITIES\nA: 2 million people\nB: 800 thousand people\nC: 1.5 million people')).kind, 'card')
})
