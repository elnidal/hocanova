import test from 'node:test'
import assert from 'node:assert/strict'
import { chooseSync } from './sync.js'

test('uzak yoksa yerel gönderilir', () => assert.equal(chooseSync({ savedAt: 5 }, null), 'push'))
test('uzak daha yeniyse uzak alınır', () => assert.equal(chooseSync({ savedAt: 5 }, { savedAt: 9 }), 'hydrate'))
test('yerel daha yeniyse gönderilir', () => assert.equal(chooseSync({ savedAt: 9 }, { savedAt: 5 }), 'push'))
test('eşitse bir şey yapılmaz', () => assert.equal(chooseSync({ savedAt: 5 }, { savedAt: 5 }), 'same'))
test('yerelde damga yoksa (eski veri) uzak kazanır', () => assert.equal(chooseSync({}, { savedAt: 1 }), 'hydrate'))
