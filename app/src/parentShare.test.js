import test from 'node:test'
import assert from 'node:assert/strict'
import { makeToken, shareUrl, parseToken, remoteToState } from './parentShare.js'
import { buildReport } from './report.js'
import { dayStamp } from './goal.js'

test('veli kodu: 24 karakter, adrese uygun, her seferinde farklı', () => {
  const a = makeToken(), b = makeToken()
  assert.match(a, /^[A-Za-z0-9_-]{24}$/); assert.notEqual(a, b)
  assert.equal(parseToken('#veli=' + a), a)
  assert.equal(parseToken('#veli=kisa'), null); assert.equal(parseToken('#ogretmen'), null); assert.equal(parseToken(''), null)
  assert.equal(shareUrl('https://x.app', a), `https://x.app/#veli=${a}`)
})

test('uzak özetten rapor üretilir', () => {
  const now = new Date(2026, 9, 23, 12).getTime()
  const r = { nick: 'Zeynep', group: '8A', daily: { [dayStamp(now)]: 12 }, doneDays: { u1d1: {} },
    items: { 'U1-001': { status: 'unc', wrong: 3 }, 'U1-002': { status: 'known', wrong: 1 } },
    log: [{ t: now - 1000, ok: true }, { t: now - 2000, ok: false }] }
  const st = remoteToState(r)
  const rep = buildReport({ progress: st.progress, daily: st.daily, doneDays: st.doneDays, items: [{ id: 'U1-001', display: 'invite', meaning_tr: 'davet etmek' }, { id: 'U1-002', display: 'x', meaning_tr: 'y' }], now })
  assert.equal(rep.weekTotal, 12); assert.equal(rep.accuracy, 50); assert.equal(rep.hardest[0].display, 'invite'); assert.equal(st.profile.nick, 'Zeynep')
})

test('yapıştırılan bağlantıdan ya da koddan veli kodu', async () => {
  const { extractToken } = await import('./parentShare.js')
  const t = 'Ab3_-cdEFghIJklMNopQRstu'
  assert.equal(extractToken(`https://lgsingilizce.app/#veli=${t}`), t)
  assert.equal(extractToken(`  Raporum: https://hocanova.netlify.app/#veli=${t} `), t)
  assert.equal(extractToken(t), t)
  assert.equal(extractToken('kısa'), null)
})
