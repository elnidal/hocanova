import test from 'node:test'
import assert from 'node:assert/strict'
import { teaserFor } from './teaser.js'

test('merak bitişi: yarınki ilk sahne, sınav provası ya da hiç', () => {
  assert.equal(teaserFor(null), null)
  assert.equal(teaserFor({ mini: [] }), null)
  assert.deepEqual(teaserFor({ mini: [{ durum: 'Kaan sahilde kale yaptı; dalga yaklaşıyor.' }] }), { kind: 'scene', text: 'Kaan sahilde kale yaptı; dalga yaklaşıyor…' })
  assert.match(teaserFor({ exam: true, title: 'Sınav provası: broşür, tablo, çözüm' }).text, /^Yarın sınav provası: broşür, tablo, çözüm\./)
})
