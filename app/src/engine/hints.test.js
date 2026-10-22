import test from 'node:test'
import assert from 'node:assert/strict'
import { hintFor, hintCollapsed, STEM_TR, HINT_FADE_AFTER } from './hints.js'

const h = prompt => hintFor({ prompt })?.text

test('sık görülen soru kökleri için Türkçe satır üretilir', () => {
  assert.equal(h('Choose the best option.'), 'En uygun seçeneği seç.')
  assert.equal(h('<en>Which of the following completes the dialogue?</en>'), STEM_TR.S01)
  assert.equal(h('Which one completes the sentence?'), 'Hangisi cümleyi tamamlar?')
  assert.equal(h('Which sentence is correct?'), 'Hangi cümle doğrudur?')
})

test('"According to the X ... TRUE / NOT true" kuralı doğru hâl ekini kullanır', () => {
  assert.equal(h('According to the text, which of the following is TRUE?'), 'Metne göre aşağıdakilerden hangisi doğrudur?')
  assert.equal(h('According to the message, which of the following is NOT true?'), 'Mesaja göre aşağıdakilerden hangisi doğru DEĞİLDİR?')
  assert.equal(h('According to the table, which of the following is correct?'), 'Tabloya göre aşağıdakilerden hangisi doğrudur?')
  assert.equal(h('Which of the following is NOT mentioned in the recipe?'), STEM_TR.S03)
})

test('kişi adlı kökler ve stem_id yedeği', () => {
  assert.equal(h('Which word describes Selin?'), 'Hangi kelime Selin için uygundur?')
  assert.equal(hintFor({ prompt: 'Something unusual here?', stem_id: 'S14' }).text, STEM_TR.S14)
  assert.equal(hintFor({ prompt: 'Something unusual here?' }), null)
})

test('prompt_tr her şeyden önce gelir; Türkçe soruya satır eklenmez', () => {
  assert.equal(hintFor({ prompt: '<en>Who?</en>', prompt_tr: 'Kim?' }).text, 'Kim?')
  assert.equal(hintFor({ prompt: 'Boşluğa uygun olanı seç.' }), null)
  assert.equal(hintFor({ prompt: 'Hikâyede "bowl" ne anlama geliyordu?' }), null)
})

test('satır belirli sayıda gösterimden sonra daraltılır', () => {
  const key = 'p:x'
  assert.equal(hintCollapsed({ [key]: HINT_FADE_AFTER - 1 }, key), false)
  assert.equal(hintCollapsed({ [key]: HINT_FADE_AFTER }, key), true)
  assert.equal(hintCollapsed({}, key), false)
})

test('ek kalıplar: kişi adlı sorular, "Look at …" ve Türkçe tespiti', () => {
  assert.equal(h('What did Kaan do?'), 'Kaan ne yaptı?')
  assert.equal(h('How does Ece feel?'), 'Ece nasıl hissediyor?')
  assert.equal(h('Look at the survey results. Which sentence is TRUE?'), 'Hangi cümle doğrudur?')
  assert.equal(h('Which one is NOT a team sport?'), 'Hangisi bu gruba ait DEĞİLDİR?')
  assert.equal(hintFor({ prompt: 'Hikâyede "invite" ne anlama geliyordu?' }), null)
})
