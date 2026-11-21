import test from 'node:test'
import assert from 'node:assert/strict'
import { englishOf, listenParts } from './listenParts.js'

test('dinleme: yalnız İngilizce parçalar, şıklar harfle', () => {
  assert.equal(englishOf('<en>Which one completes the dialogue?</en>'), 'Which one completes the dialogue?')
  assert.equal(englishOf('Hikâyede "{U3-001|bake}" ne anlama geliyordu?'), '')
  assert.equal(englishOf('Kaan: <en>I {U3-001|bake} bread.</en> Sonra yeriz.'), 'I bake bread.')
  const parts = listenParts({ prompt: '<en>Which is correct?</en>', stem: '<en>A: Hi\nB: ____</en>', options: ['Hello.', 'Bye.', 'Thanks.'] })
  assert.deepEqual(parts, ['Which is correct?', 'A: Hi\nB: ____', 'A. Hello.', 'B. Bye.', 'C. Thanks.'])
  // Türkçe şık varsa şıklar okunmaz (karışık okuma yanıltır)
  assert.deepEqual(listenParts({ prompt: '<en>What does it mean?</en>', options: ['pişirmek', 'koşmak', 'uyumak'] }), ['What does it mean?'])
})
