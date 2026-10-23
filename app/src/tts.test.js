import test from 'node:test'
import assert from 'node:assert/strict'
import { rankVoice, bestVoice, speakable } from './tts.js'

const v = (name, lang, localService = true) => ({ name, lang, localService })

test('ses seçimi: kaliteli İngiliz sesi önde, yenilik/compact/Türkçe elenir', () => {
  const list = [v('Albert', 'en-US'), v('Samantha', 'en-US'), v('Daniel', 'en-GB'), v('Tessa (Compact)', 'en-ZA'), v('Yelda', 'tr-TR'), v('Google UK English Female', 'en-GB', false)]
  assert.equal(bestVoice(list).name, 'Google UK English Female')
  assert.equal(rankVoice(v('Yelda', 'tr-TR')), -1)
  assert.ok(rankVoice(v('Albert', 'en-US')) < rankVoice(v('Samantha', 'en-US')))
  assert.equal(bestVoice([v('Yelda', 'tr-TR')]), null)
})

test('okunacak metin: Türkçe etiket ve semboller çıkarılır', () => {
  assert.equal(speakable('Sounds + SIFAT!'), 'Sounds !')
  assert.equal(speakable('I want to ________ it'), 'I want to blank it')
  assert.equal(speakable('Would you like to …?'), 'Would you like to ?')
})
