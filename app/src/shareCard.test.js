import test from 'node:test'
import assert from 'node:assert/strict'
import { cardText, worthSharing } from './shareCard.js'

test('paylaşım kartı metinleri', () => {
  assert.deepEqual(cardText({ kind: 'post', title: 'Ünite 1', from: 30, to: 80 }), { head: 'Ünite 1 tamam!', big: '%30 → %80', sub: '50 puan ilerledim', foot: 'Ünite giriş testi → çıkış testi' })
  assert.equal(cardText({ kind: 'post', title: 'Ünite 1', from: null, to: 70 }).big, '%70')
  assert.equal(cardText({ kind: 'weekly', title: 'x', to: 90 }).head, "Bu haftanın Cuma quiz'i")
  assert.equal(cardText({ kind: 'post', title: 'Ü', from: 60, to: 50 }).sub, 'Çalışmaya devam!')
})

test('gerileme ya da düşük sonuç paylaşılmaya önerilmez', () => {
  assert.equal(worthSharing({ kind: 'post', from: 30, to: 27 }), false)
  assert.equal(worthSharing({ kind: 'post', from: 30, to: 80 }), true)
  assert.equal(worthSharing({ kind: 'post', from: null, to: 40 }), false)
  assert.equal(worthSharing({ kind: 'weekly', to: 70 }), true)
})
