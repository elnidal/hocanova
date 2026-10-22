import test from 'node:test'
import assert from 'node:assert/strict'
import { splitAt, buildExamples, flashDeck } from './flash.js'
import { createProgress, recordFlash, recordAnswer } from './engine/index.js'

test('örnek cümlede ifadeyi bulur (büyük/küçük harf, eğik çizgili biçimler)', () => {
  assert.deepEqual(splitAt('We are going on holiday to Çeşme.', 'vacation / holiday'), ['We are going on ', 'holiday', ' to Çeşme.'])
  assert.deepEqual(splitAt('Would you like to come early?', 'Would you like to …?'), ['', 'Would you like to', ' come early?'])
  assert.deepEqual(splitAt('Nothing here.', 'ancient'), ['Nothing here.', '', ''])
})

test('örnek: kart varsa kart, yoksa doldurulmuş kullan sorusu', () => {
  const units = [{ items: [{ id: 'U1-001', display: 'accept' }, { id: 'U7-001', display: 'ancient' }], days: [
    { steps: [{ item: 'U1-001', kullan: { stem: "<en>I'm happy to ________ it!</en>", options: ['accept', 'refuse'], answer: 0 } }] },
    { steps: [{ item: 'U7-001', card: { example_en: 'Ephesus is an ancient city.', example_tr: 'Efes antik bir şehir.' } }] },
  ] }]
  const ex = buildExamples(units)
  assert.deepEqual(ex['U1-001'].parts, ["I'm happy to ", 'accept', ' it!'])
  assert.deepEqual(ex['U7-001'], { parts: ['Ephesus is an ', 'ancient', ' city.'], tr: 'Efes antik bir şehir.' })
})

test('kart cevabı durumu değiştirmez, yalnız sırayı etkiler; desteler', () => {
  const now = 1e12
  let p = createProgress()
  p = recordAnswer(p, { itemId: 'a', qid: 'q1', correct: false, now })
  p = recordAnswer(p, { itemId: 'b', qid: 'q2', correct: true, now })
  const before = p.items.b.status
  p = recordFlash(p, { itemId: 'b', rating: 'know', now })
  assert.equal(p.items.b.status, before)
  p = recordFlash(p, { itemId: 'b', rating: 'dont', now: now + 5 })
  assert.equal(p.items.b.due, now + 5); assert.equal(p.items.b.flashMiss, 1)
  assert.equal(p.items.b.status, before)
  assert.deepEqual(flashDeck(p, 'hard').sort(), ['a', 'b'])
  assert.deepEqual(flashDeck(p, 'learned'), ['b']) // 'a' hiç doğru yapılmadı: hâlâ yeni
})
