import test from 'node:test'
import assert from 'node:assert/strict'
import { cleanProfile, isValidProfile } from './profile.js'

test('takma ad kırpılır, boşluklar tekleşir, 24 karakterle sınırlanır', () => {
  assert.equal(cleanProfile({ nick: '  Mavi   Kedi ' }).nick, 'Mavi Kedi')
  assert.equal(cleanProfile({ nick: 'x'.repeat(40) }).nick.length, 24)
})
test('sınıf kodu büyük harf ve boşluksuz', () => {
  assert.equal(cleanProfile({ nick: 'Ali', group: ' 8 a ' }).group, '8A')
})
test('geçerlilik: en az 2 karakterlik takma ad', () => {
  assert.equal(isValidProfile(cleanProfile({ nick: ' a ' })), false)
  assert.equal(isValidProfile(cleanProfile({ nick: 'Al' })), true)
  assert.equal(isValidProfile(cleanProfile({})), false)
})
