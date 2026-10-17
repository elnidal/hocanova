import test from 'node:test'
import assert from 'node:assert/strict'
import { DAY, createProgress, recordAnswer, dayKey, lessonsToday, canStartLesson, nextLessonOpensAt, calendarDaysBetween, retentionState } from './index.js'

const at = (y, m, d, h = 12) => new Date(y, m - 1, d, h).getTime()

test('aynı takvim günü ikinci ders engellenir, ertesi gün açılır', () => {
  const done = { u1d1: { at: at(2026, 10, 19, 9) } }
  assert.equal(lessonsToday(done, at(2026, 10, 19, 23)), 1)
  assert.equal(canStartLesson(done, at(2026, 10, 19, 23)), false)
  assert.equal(canStartLesson(done, at(2026, 10, 20, 0)), true)
  assert.equal(canStartLesson({}, at(2026, 10, 19)), true)
})

test('gece yarısı sınırı yerel saate göredir; nextLessonOpensAt ertesi gün 00:00', () => {
  const now = at(2026, 10, 19, 23)
  assert.equal(dayKey(nextLessonOpensAt(now)), dayKey(at(2026, 10, 20)))
  assert.equal(new Date(nextLessonOpensAt(now)).getHours(), 0)
  assert.equal(calendarDaysBetween(at(2026, 10, 19, 23), at(2026, 10, 20, 1)), 1)
})

const section = { id: 'day08', questions: [{ item: 'A' }, { item: 'B' }] }
const base = { section, unit: 1, retentions: {}, progress: createProgress() }
const seen = p => ['A', 'B'].reduce((x, id) => recordAnswer(x, { itemId: id, qid: 'q', correct: true, kind: 'lesson', now: 1 }), p)

test('kalıcılık: ünite başlamadıysa not-started', () => {
  assert.equal(retentionState({ ...base, doneDays: {}, now: at(2026, 10, 19) }).status, 'not-started')
})

test('kalıcılık: ilk dersten 7 gün dolmadan bekler, gün sayısını söyler', () => {
  const doneDays = { u1d1: { at: at(2026, 10, 19, 10) } }
  assert.deepEqual(retentionState({ ...base, doneDays, now: at(2026, 10, 22) }), { status: 'wait', days: 4 })
  assert.equal(retentionState({ ...base, doneDays, now: at(2026, 10, 25) }).days, 1)
})

test('kalıcılık: süre dolduysa ama kelimeler görülmediyse need-lessons; görüldüyse ready', () => {
  const doneDays = { u1d1: { at: at(2026, 10, 19) }, u1d2: { at: at(2026, 10, 20) } }
  const now = at(2026, 10, 26)
  assert.deepEqual(retentionState({ ...base, doneDays, now }), { status: 'need-lessons', unseen: 2 })
  assert.equal(retentionState({ ...base, doneDays, now, progress: seen(createProgress()) }).status, 'ready')
})

test('kalıcılık: gün 15 için 14 gün; yapılmışsa done ve sonuç döner', () => {
  const s15 = { id: 'day15', questions: [{ item: 'A' }] }
  const doneDays = { u1d1: { at: at(2026, 10, 19) } }
  assert.equal(retentionState({ ...base, section: s15, doneDays, now: at(2026, 10, 25) }).status, 'wait')
  assert.equal(retentionState({ ...base, section: s15, doneDays, now: at(2026, 11, 2), progress: seen(createProgress()) }).status, 'ready')
  const r = retentionState({ ...base, doneDays, now: at(2026, 11, 2), retentions: { 'u1:day08': { ok: 8, n: 10 } } })
  assert.deepEqual(r, { status: 'done', ok: 8, n: 10 })
})
