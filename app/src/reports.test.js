import test from 'node:test'
import assert from 'node:assert/strict'

import { cleanReport } from './reportsCore.js'

test('bildirim temizlenir ve sınırlanır', () => {
  const r = cleanReport({ qid: 'd01-001-k', itemId: 'U1-001', kind: 'wrong', note: '  çok   uzun '.repeat(80), screen: 'lesson' })
  assert.equal(r.qid, 'd01-001-k'); assert.equal(r.kind, 'wrong'); assert.ok(r.note.length <= 300)
  assert.equal(cleanReport({ qid: 'x', kind: 'bilinmeyen' }), null)
  assert.equal(cleanReport({ kind: 'wrong' }), null)
  assert.equal(cleanReport({ qid: 'x', kind: 'other', note: '   ' }).note, null)
})
