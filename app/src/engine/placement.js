import { setStatus } from './progress.js'

/** 18 soruluk başlangıç testi. correctById: { 'pl-a1': true, ... }. Eşikler placement.yaml scoring bölümünden. */
export function scorePlacement(def, correctById) {
  const score = {}
  for (const s of def.sections) score[s.id] = s.questions.filter(q => correctById[q.id]).length
  const tot = Object.values(score).reduce((a, b) => a + b, 0)
  const level = tot <= 8 ? 'baslangic' : tot <= 14 ? 'orta' : 'ileri'
  // Kelime tanıma zayıfsa önce o; değilse bağlam/sınav boyutlarından düşük olan.
  const focus = score.A <= 3 ? 'A' : score.B <= score.C ? 'B' : 'C'
  return { score, tot, level, focus }
}

/**
 * Ünite giriş kontrolü ("biliyor musun?" + doğrulama).
 * claimed: "evet" denen birimler; verified: { id: ilk denemede doğru mu }; fakes: uydurma kelimelere "evet" sayısı.
 * Uydurmaya çok "evet" dendiyse (≥ threshold) doğrulanan bile yalnız "kararsız" olur.
 */
export function applyUnitCheck(p, { itemIds, claimed, verified, fakes, threshold = 2, now }) {
  const strict = fakes >= threshold
  let out = p
  for (const id of itemIds) out = setStatus(out, id, 'new', { source: 'check' })
  for (const id of claimed) {
    if (verified[id]) out = setStatus(out, id, strict ? 'unc' : 'known', { now, source: 'check', box: strict ? 0 : 2 })
  }
  return out
}
