import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import {
  DAY, createProgress, recordAnswer, setLevel, statusOf, getItem, counts,
  dueItems, dueCountBy, nextDueAt, buildQuestionIndex, pickQuestion, shuffleOptions, isCorrect, mulberry32,
  scorePlacement, applyUnitCheck, planLesson,
} from './index.js'

const T0 = 1_700_000_000_000
const ans = (p, itemId, qid, correct, kind, now) => recordAnswer(p, { itemId, qid, correct, kind, now })

test('ilk doğru ders cevabı new → unc yapar, ertesi gün tekrar planlar', () => {
  const p = ans(createProgress(), 'U1-001', 'q1', true, 'lesson', T0)
  assert.equal(statusOf(p, 'U1-001'), 'unc')
  assert.equal(getItem(p, 'U1-001').due, T0 + DAY)
})

test('aynı gün üç doğru cevap "biliniyor" yapmaz', () => {
  let p = createProgress()
  for (const [i, q] of ['z', 'k', 's'].entries()) p = ans(p, 'U1-001', q, true, 'lesson', T0 + i * 60_000)
  assert.equal(statusOf(p, 'U1-001'), 'unc')
})

test('ertesi gün farklı soruda doğru tekrar → known', () => {
  let p = ans(createProgress(), 'U1-001', 'z', true, 'lesson', T0)
  p = ans(p, 'U1-001', 'r1', true, 'review', T0 + DAY)
  assert.equal(statusOf(p, 'U1-001'), 'known')
})

test('aynı soruyu ertesi gün doğru yapmak yetmez (2 farklı soru gerekir)', () => {
  let p = ans(createProgress(), 'U1-001', 'z', true, 'lesson', T0)
  p = ans(p, 'U1-001', 'z', true, 'review', T0 + DAY)
  assert.equal(statusOf(p, 'U1-001'), 'unc')
})

test('yanlış cevap seriyi sıfırlar, ertesi güne çeker, known → unc yapar', () => {
  let p = ans(createProgress(), 'U1-001', 'z', true, 'lesson', T0)
  p = ans(p, 'U1-001', 'r1', true, 'review', T0 + DAY)
  p = recordAnswer(p, { itemId: 'U1-001', qid: 'r2', correct: false, kind: 'review', chosen: 'x', now: T0 + 5 * DAY })
  const it = getItem(p, 'U1-001')
  assert.equal(it.status, 'unc')
  assert.equal(it.streak, 0)
  assert.equal(it.due, T0 + 6 * DAY)
  assert.equal(it.conf.x, 1)
})

test('doğru ders dışı cevaplar aralığı uzatır; seviye aralığı değiştirir', () => {
  const run = level => {
    let p = createProgress(level)
    p = ans(p, 'A', 'q0', true, 'lesson', T0)
    p = ans(p, 'A', 'q1', true, 'review', T0 + DAY)
    p = ans(p, 'A', 'q2', true, 'review', T0 + 4 * DAY)
    return getItem(p, 'A').due - (T0 + 4 * DAY)
  }
  assert.equal(run('orta') / DAY, 7)
  assert.equal(run('baslangic') / DAY, 4)
  assert.equal(run('ileri') / DAY, 10)
  assert.throws(() => setLevel(createProgress(), 'x'))
})

test('recordAnswer girdiyi değiştirmez', () => {
  const p = createProgress()
  const snap = JSON.stringify(p)
  ans(p, 'A', 'q', true, 'lesson', T0)
  assert.equal(JSON.stringify(p), snap)
})

test('dueItems: vakti gelenler, en gecikenden, tavanlı; yeni+hiç yanlışsız olanlar girmez', () => {
  let p = createProgress()
  for (let i = 0; i < 12; i++) p = ans(p, `W${i}`, 'q', true, 'lesson', T0 + i * 1000)
  assert.equal(dueItems(p, T0).length, 0)
  const due = dueItems(p, T0 + 2 * DAY)
  assert.equal(due.length, 10)
  assert.equal(due[0], 'W0')
  assert.deepEqual(dueItems(p, T0 + 2 * DAY, { exclude: ['W0'], limit: 2 }), ['W1', 'W2'])
  assert.ok(nextDueAt(p, T0) > T0)
})

test('yanlış yapılan kelime bir sonraki gün listede ve öne geçer', () => {
  let p = ans(createProgress(), 'A', 'q', true, 'lesson', T0)
  p = ans(p, 'B', 'q', true, 'lesson', T0)
  p = ans(p, 'B', 'q2', false, 'lesson', T0 + 1000)
  assert.deepEqual(dueItems(p, T0 + DAY + 1000), ['A', 'B'].sort((a, b) => getItem(p, a).due - getItem(p, b).due || getItem(p, b).wrong - getItem(p, a).wrong))
  const fresh = ans(createProgress(), 'N', 'q', false, 'check', T0)
  assert.deepEqual(dueItems(fresh, T0 + DAY), ['N'])
})

const index = buildQuestionIndex({
  units: [{ unit: 1, days: [{ day: 1, steps: [{ item: 'A', sezdir: { id: 'z', options: ['a', 'b'], answer: 0 }, kullan: { id: 'k', options: ['a', 'b'], answer: 0 }, sina: { id: 's', options: ['a', 'b'], answer: 0 } }], review: [{ id: 'r1', item: 'A', options: ['a', 'b'], answer: 0 }] }] }],
  retention: { sections: [{ questions: [{ id: 'rt1', item: 'A', options: ['a', 'b'], answer: 0 }] }] },
})

test('soru dizini tüm rolleri toplar', () => {
  assert.deepEqual(index.get('A').map(q => q.id).sort(), ['k', 'r1', 'rt1', 's', 'z'])
})

test('pickQuestion: son sorulanı ve doğru yapılanı tekrar etmez, sezdir seçmez', () => {
  let p = ans(createProgress(), 'A', 'k', true, 'lesson', T0)
  p = ans(p, 'A', 's', true, 'lesson', T0)
  const rng = mulberry32(7)
  for (let i = 0; i < 50; i++) {
    const q = pickQuestion(index, 'A', p, { rng })
    assert.ok(['r1', 'rt1'].includes(q.id), q.id)
  }
  assert.equal(pickQuestion(index, 'YOK', p), null)
})

test('pickQuestion: tüm sorular görüldüyse yine de son sorulandan farklı seçer', () => {
  let p = createProgress()
  for (const q of ['k', 's', 'r1', 'rt1']) p = ans(p, 'A', q, true, 'review', T0)
  const rng = mulberry32(3)
  for (let i = 0; i < 30; i++) assert.notEqual(pickQuestion(index, 'A', p, { rng }).id, 'rt1')
})

test('shuffleOptions doğru şıkkı izler', () => {
  const q = { id: 'x', options: ['doğru', 'b', 'c', 'd'], answer: 0 }
  const rng = mulberry32(42)
  const seen = new Set()
  for (let i = 0; i < 40; i++) {
    const s = shuffleOptions(q, rng)
    assert.equal(s.options[s.correctIndex], 'doğru')
    assert.ok(isCorrect(s, s.correctIndex) && !isCorrect(s, (s.correctIndex + 1) % 4))
    seen.add(s.correctIndex)
  }
  assert.ok(seen.size > 1)
})

const def = { sections: ['A', 'B', 'C'].map(id => ({ id, questions: Array.from({ length: 6 }, (_, i) => ({ id: `${id}${i}` })) })) }
const correctN = (a, b, c) => Object.fromEntries([['A', a], ['B', b], ['C', c]].flatMap(([s, n]) => Array.from({ length: n }, (_, i) => [`${s}${i}`, true])))

test('scorePlacement: seviye sınırları ve odak', () => {
  assert.equal(scorePlacement(def, correctN(3, 3, 2)).level, 'baslangic')
  assert.equal(scorePlacement(def, correctN(3, 3, 3)).level, 'orta')
  assert.equal(scorePlacement(def, correctN(5, 5, 4)).level, 'orta')
  assert.equal(scorePlacement(def, correctN(5, 5, 5)).level, 'ileri')
  assert.equal(scorePlacement(def, correctN(2, 6, 6)).focus, 'A')
  assert.equal(scorePlacement(def, correctN(6, 2, 5)).focus, 'B')
  assert.equal(scorePlacement(def, correctN(6, 5, 2)).focus, 'C')
})

test('applyUnitCheck: doğrulananlar known, yanlışlar new, uydurmaya evet → unc', () => {
  const base = { itemIds: ['a', 'b', 'c'], claimed: ['a', 'b'], verified: { a: true, b: false }, now: T0 }
  let p = applyUnitCheck(createProgress(), { ...base, fakes: 0 })
  assert.deepEqual(['a', 'b', 'c'].map(i => statusOf(p, i)), ['known', 'new', 'new'])
  assert.ok(getItem(p, 'a').due > T0)
  p = applyUnitCheck(createProgress(), { ...base, fakes: 2 })
  assert.equal(statusOf(p, 'a'), 'unc')
  assert.deepEqual(counts(p, ['a', 'b', 'c']), { known: 0, unc: 1, new: 2 })
})

test('planLesson: bilinen kelimede sezdir atlanır; ek tekrar günün kelimelerini içermez', () => {
  let p = applyUnitCheck(createProgress(), { itemIds: ['A', 'B'], claimed: ['A'], verified: { A: true }, fakes: 0, now: T0 })
  p = ans(p, 'Z', 'q', true, 'lesson', T0 - 3 * DAY)
  const day = { steps: [{ item: 'A' }, { item: 'B' }], review: [{ id: 'r' }] }
  const plan = planLesson(day, p, T0 + 10 * DAY)
  assert.deepEqual(plan.steps[0], { item: 'A', parts: ['kullan', 'sina'], skippedSezdir: true })
  assert.deepEqual(plan.steps[1].parts, ['sezdir', 'kullan', 'sina'])
  assert.deepEqual(plan.extraReview, ['Z'])
})

// Gerçek içerik sağlık kontrolü (npm run content çalıştırılmışsa)
const CONTENT = new URL('../../public/content/', import.meta.url)
test('gerçek içerik: tüm sorularda answer 0 ve ≥2 şık; her adım kelimesinin 3 sorusu var', { skip: !fs.existsSync(new URL('index.json', CONTENT)) }, () => {
  const idx = JSON.parse(fs.readFileSync(new URL('index.json', CONTENT)))
  const units = idx.units.map(u => JSON.parse(fs.readFileSync(new URL(`unit_${String(u.unit).padStart(2, '0')}.json`, CONTENT))))
  const index = buildQuestionIndex({ units, retention: idx.retention })
  let n = 0
  for (const qs of index.values()) for (const q of qs) {
    n++
    assert.equal(q.answer, 0, q.id)
    assert.ok(q.options.length >= 2, q.id)
  }
  for (const u of units) for (const d of u.days) for (const s of d.steps) {
    const roles = index.get(s.item).filter(q => q.day === d.day && q.unit === u.unit).map(q => q.role)
    const need = d.mode === 'light' ? ['kullan', 'sina', 'review'] : ['sezdir', 'kullan', 'sina'] // hafif modda sezdir yok; tekrar sorusu var
    for (const r of need) assert.ok(roles.includes(r), `${s.item} ${r}`)
  }
  assert.ok(n > 500)
})

test('hafif mod: tekrar sorusu indekste "review" rolüyle; ders planında ilk adım kart', () => {
  const light = { unit: 7, days: [{ day: 1, mode: 'light', steps: [{ item: 'L', card: {}, kullan: { id: 'k', options: ['a', 'b'], answer: 0 }, sina: { id: 's', options: ['a', 'b'], answer: 0 }, tekrar: { id: 't', options: ['a', 'b'], answer: 0 } }] }] }
  const idx = buildQuestionIndex({ units: [light], retention: null })
  assert.deepEqual(idx.get('L').map(q => `${q.id}:${q.role}`).sort(), ['k:kullan', 's:sina', 't:review'])
  const plan = planLesson(light.days[0], createProgress(), T0)
  assert.deepEqual(plan.steps[0].parts, ['card', 'kullan', 'sina'])
  const known = applyUnitCheck(createProgress(), { itemIds: ['L'], claimed: ['L'], verified: { L: true }, fakes: 0, now: T0 })
  assert.deepEqual(planLesson(light.days[0], known, T0).steps[0].parts, ['kullan', 'sina'])
  // tekrar sorusu, ders günü soruları doğru yapılmışsa tekrarda seçilir
  let p = ans(createProgress(), 'L', 'k', true, 'lesson', T0)
  p = ans(p, 'L', 's', true, 'lesson', T0)
  assert.equal(pickQuestion(idx, 'L', p).id, 't')
})

test('dueCountBy: verilen zamana kadar vadesi gelenleri sayar', () => {
  let p = ans(createProgress(), 'A', 'q', true, 'lesson', T0)
  p = ans(p, 'B', 'q', true, 'lesson', T0 + 3 * DAY)
  assert.equal(dueCountBy(p, T0 + DAY), 1)
  assert.equal(dueCountBy(p, T0 + 5 * DAY), 2)
  assert.equal(dueCountBy(createProgress(), T0), 0)
})
