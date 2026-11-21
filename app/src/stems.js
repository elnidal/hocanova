// LGS soru tipleri (soru kökleri S01–S14): içerikteki sayı, öğrencinin doğru oranı, tipe göre alıştırma ve
// Mini LGS'de tipe göre kayıp. Kaynak: lgs-kaynak/exam/sinav_dili.yaml. Saf fonksiyonlar, testli.
import { STEM_TR } from './engine/hints.js'

export const STEMS = [
  ['S01', 'Diyalog tamamlama'], ['S02', 'Cevabı metinde olmayan soru'], ['S03', 'Metinde geçmeyen bilgi'],
  ['S04', 'Metne göre doğru bilgi'], ['S05', 'Başlık ve ana fikir'], ['S06', 'Tablo ve grafik okuma'],
  ['S07', 'Sıralama ve adımlar'], ['S08', 'Kişi eşleştirme (Who …?)'], ['S09', 'İşlev örneği (davet, ret, özür…)'],
  ['S10', 'Durumda ne söylenir?'], ['S11', 'Amaç: neden arıyor / yazıyor?'], ['S12', 'Kelime ve altı çizili kısım'],
  ['S13', 'Eksik soruyu bulma'], ['S14', 'Çıkarım yapma'],
].map(([id, name]) => ({ id, name, tr: STEM_TR[id] }))
export const stemName = id => STEMS.find(s => s.id === id)?.name || 'Diğer'

const exam = q => q.lgs_like && q.stem_id && q.options?.length >= 3 && ['sina', 'review'].includes(q.role)

/** Her tipten içerikte kaç LGS biçimli soru var. */
export function stemCounts(qIndex) {
  const c = {}
  for (const qs of qIndex.values()) for (const q of qs) if (exam(q)) c[q.stem_id] = (c[q.stem_id] || 0) + 1
  return c
}

/** Öğrencinin tip tip doğru oranı (cevap kaydından). { S01: { ok, n } } */
export function stemAccuracy(qIndex, log = []) {
  const stemOf = new Map()
  for (const qs of qIndex.values()) for (const q of qs) if (q.stem_id) stemOf.set(q.id, q.stem_id)
  const out = {}
  for (const e of log) {
    const s = e.qid && stemOf.get(e.qid)
    if (!s) continue
    const r = (out[s] ||= { ok: 0, n: 0 })
    r.n++; if (e.ok) r.ok++
  }
  return out
}

/** Tipe göre alıştırma: verilen ünitelerden (yoksa hepsinden) ifade başına bir soru, en fazla n. */
export function pickStem(qIndex, stem, units = [], { n = 6, rng = Math.random } = {}) {
  const pool = []
  for (const [itemId, qs] of qIndex) {
    const cand = qs.filter(q => exam(q) && q.stem_id === stem && (!units.length || units.includes(q.unit)))
    if (cand.length) pool.push({ ...cand[Math.floor(rng() * cand.length)], itemId })
  }
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]] }
  return pool.slice(0, n)
}

/** Mini LGS'de en çok kayıp olan tipler (yanlış önce, sonra boş). */
export function weakStems(byStem = {}, max = 2) {
  return Object.entries(byStem).filter(([s, r]) => s !== 'diğer' && r.y + r.b > 0)
    .sort(([a, x], [b, y]) => (y.y - x.y) || (y.b - x.b) || a.localeCompare(b)).slice(0, max).map(([s]) => s)
}
