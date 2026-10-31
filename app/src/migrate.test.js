import test from 'node:test'
import assert from 'node:assert/strict'
import { encode, decode, shouldApply, applyMigration, PREFIX } from './migrate.js'

const K = 'hikayenglish.lgs.app.v1'
const memStore = (init = {}) => { const m = new Map(Object.entries(init)); return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, v), m } }

test('kodla-çöz: Türkçe ve uzun veri bozulmadan taşınır', async () => {
  const payload = { data: { [K]: JSON.stringify({ savedAt: 5, nick: 'Şükrü ğüşiöç', log: Array(500).fill('U1-001') }), 'sb-x-auth-token': '{"a":1}' }, hash: '#veli=AB' }
  const s = await encode(payload)
  assert.match(s, /^[gr][A-Za-z0-9_-]+$/)
  assert.deepEqual(await decode(s), payload)
})

test('yalnız boş ya da daha eski ilerlemenin üstüne yazar', () => {
  const inc = { [K]: JSON.stringify({ savedAt: 10 }) }
  assert.equal(shouldApply(inc, null), true)
  assert.equal(shouldApply(inc, JSON.stringify({ savedAt: 5 })), true)
  assert.equal(shouldApply(inc, JSON.stringify({ savedAt: 20 })), false)
  assert.equal(shouldApply({}, null), false)
})

test('açılışta veriyi yazar, özgün # ile yeniden açar', async () => {
  const data = { [K]: JSON.stringify({ savedAt: 3 }), 'sb-p-auth-token': 'tok' }
  const loc = { hash: PREFIX + await encode({ data, hash: '#ogretmen' }), pathname: '/', search: '?odev=50', replace(u) { this.to = u } }
  const st = memStore()
  assert.equal(await applyMigration(loc, st), true)
  assert.equal(st.getItem('sb-p-auth-token'), 'tok')
  assert.equal(loc.to, '/?odev=50#ogretmen')
  assert.equal(await applyMigration({ hash: '#tahta' }, st), false)
})
