import test from 'node:test'
import assert from 'node:assert/strict'
import { classCodeFrom, classLabelPrefix, codeLooksGuessable, isMissingRpc, makeClassCode, randomSuffix } from './classCode.js'

test('sınıf kodu: etiket + belirsiz olmayan sonek', () => {
  assert.equal(classLabelPrefix(' 8 / a '), '8A')
  assert.equal(classLabelPrefix(''), 'SINIF')
  assert.equal(classLabelPrefix('Çok uzun ad'), 'OKUZ')
  assert.equal(classCodeFrom('8-A', 'K7QX'), '8A-K7QX')
  assert.equal(classCodeFrom('8A', 'k7qx'), '8A-K7QX')
  assert.equal(classCodeFrom('8A', 'K7Q0'), null)
  assert.equal(classCodeFrom('8A', 'K7QI'), null)
  assert.equal(classCodeFrom('8A', 'K7Q'), null)
})

test('kısa kod tahmin edilebilir, 8A-K7QX değil', () => {
  assert.equal(codeLooksGuessable('8A'), true)
  assert.equal(codeLooksGuessable('8B'), true)
  assert.equal(codeLooksGuessable('8A-K7Q0'), true)
  assert.equal(codeLooksGuessable('8A-K7QX'), false)
  assert.equal(codeLooksGuessable('SINIF-2345'), false)
})

test('yedek kod üretimi alfabeden çıkar', () => {
  let i = 0
  const seq = () => [0, 0.5, 0.99, 0.1][i++]
  const code = makeClassCode('8A', seq)
  assert.equal(code, '8A-AS9D')
  assert.equal(randomSuffix(() => 0), 'AAAA')
})

test('eksik RPC ayrı, yetkisiz değil', () => {
  assert.equal(isMissingRpc({ code: 'PGRST202', message: 'Could not find the function' }), true)
  assert.equal(isMissingRpc({ code: '42883', message: 'function does not exist' }), true)
  assert.equal(isMissingRpc({ message: 'yetkisiz' }), false)
  assert.equal(isMissingRpc(null), false)
})
