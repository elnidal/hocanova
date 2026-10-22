import test from 'node:test'
import assert from 'node:assert/strict'
import { shortGloss } from './gloss.js'

test('elle yazılmış gloss_tr önceliklidir', () => assert.equal(shortGloss({ gloss_tr: 'Üzgünüm, yapamam', meaning_tr: 'Üzgünüm, …-amam.' }), 'Üzgünüm, yapamam'))
test('meaning_tr: ilk seçenek alınır, parantezler atılır', () => {
  assert.equal(shortGloss({ meaning_tr: '… ister misin? (davet)' }), '… ister misin?')
  assert.equal(shortGloss({ meaning_tr: 'bence / bana göre / inanıyorum ki' }), 'bence')
  assert.equal(shortGloss({ meaning_tr: 'geri aramak / (birine) dönüş yapmak' }), 'geri aramak')
})
test('uzun karşılık ; ya da : yerinde kesilir, çok uzunsa kısaltılır', () => {
  assert.equal(shortGloss({ meaning_tr: 'bungee: ayağa bağlı esnek iple atlama / base: uçurumdan' }), 'bungee')
  assert.ok(shortGloss({ meaning_tr: 'çok uzun bir açıklama cümlesi burada devam edip gidiyor ve bitmiyor' }).length <= 40)
  assert.equal(shortGloss(null), '')
})
