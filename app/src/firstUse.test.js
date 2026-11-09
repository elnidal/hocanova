import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { initialLearnerScreen, afterTourScreen, placementExpectation, placementExpectationLabel } from './firstUse.js'

test('Ücretsiz başla, seviye yokken doğrudan teste gider', () => {
  assert.equal(initialLearnerScreen({ hash: '#basla', placement: null }), 'placement')
})

test('seviyesi olan öğrenci #basla ile teste yeniden sokulmaz', () => {
  assert.equal(initialLearnerScreen({ hash: '#basla', placement: { level: 'orta' } }), 'home')
})

test('başka adresler ana ekranda kalır; tur kendiliğinden açılmaz', () => {
  assert.equal(initialLearnerScreen({ hash: '', placement: null }), 'home')
  assert.equal(initialLearnerScreen({ hash: '#tanitim', placement: null }), 'home')
})

test('tur bitince seviye yoksa teste, varsa ana ekrana dönülür', () => {
  assert.equal(afterTourScreen({ placement: null }), 'placement')
  assert.equal(afterTourScreen({ placement: { level: 'baslangic' } }), 'home')
})

test('beklenti metni soru sayısını ve yalnız sayısal est_minutes değerini kullanır', () => {
  const def = { est_minutes: 4, sections: [{ questions: [{}, {}, {}] }, { questions: [{}, {}] }] }
  assert.deepEqual(placementExpectation(def), { questions: 5, minutes: 4 })
  assert.equal(placementExpectationLabel(def), '5 soru · yaklaşık 4 dakika')
  assert.equal(placementExpectationLabel({ sections: [{ questions: [{}] }] }), '1 soru')
  assert.equal(placementExpectation({ est_minutes: '4', sections: [] }).minutes, null)
})

test('yerleşim kaynağı 18 soru ve 4 dakikalık tahmin taşır; karşılama bunu zorunlu tur yapmaz', () => {
  const yaml = fs.readFileSync(new URL('../../lgs-pilot/content/tests/placement.yaml', import.meta.url), 'utf8')
  assert.equal((yaml.match(/id: pl-/g) || []).length, 18)
  assert.match(yaml, /^est_minutes:\s*4\s*$/m)
  const landing = fs.readFileSync(new URL('./screens/Landing.jsx', import.meta.url), 'utf8')
  const tour = fs.readFileSync(new URL('./screens/Onboarding.jsx', import.meta.url), 'utf8')
  assert.match(landing, /18 soruluk, yaklaşık 4 dakikalık/)
  assert.match(tour, /18 soruluk, yaklaşık 4 dakikalık/)
  const app = fs.readFileSync(new URL('./App.jsx', import.meta.url), 'utf8')
  assert.match(app, /initialLearnerScreen/)
  assert.doesNotMatch(app, /!state\.onboarded && !state\.placement && screen === 'home'/)
  const css = fs.readFileSync(new URL('./styles.css', import.meta.url), 'utf8')
  assert.match(css, /\.skip\{[^}]*color:\s*var\(--ink\)/)
  assert.match(css, /\.opt\.unknown\{[^}]*color:\s*var\(--ink\)/)
  assert.match(css, /\.hint\{[^}]*color:\s*var\(--ink\)/)
})
