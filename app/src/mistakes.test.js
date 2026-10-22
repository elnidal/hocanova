import test from 'node:test'
import assert from 'node:assert/strict'
import { mistakeList, openMistakeCount } from './mistakes.js'
import { createProgress, recordAnswer, recordFlash } from './engine/index.js'

test('yanlış defteri: son yanlış, seçilen şık, sonradan düzelme', () => {
  let p = createProgress()
  p = recordAnswer(p, { itemId: 'a', qid: 'qa', correct: false, chosen: 'refuse', now: 1 })
  p = recordAnswer(p, { itemId: 'b', qid: 'qb', correct: false, chosen: 'lazy', now: 2 })
  p = recordAnswer(p, { itemId: 'b', qid: 'qb', correct: true, now: 3 })
  p = recordAnswer(p, { itemId: 'c', qid: 'qc', correct: true, now: 4 })
  p = recordFlash(p, { itemId: 'c', rating: 'dont', now: 5 })
  const list = mistakeList(p)
  assert.deepEqual(list.map(m => [m.qid, m.fixed, m.chosen]), [['qa', false, 'refuse'], ['qb', true, 'lazy']])
  assert.equal(openMistakeCount(p), 1)
})
