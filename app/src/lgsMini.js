// Mini LGS (10 soru, süreli, net hesaplı) ve deneme sonrası tamir seti. Saf fonksiyonlar, testli.

export const MINI_N = 10
export const MINI_SECS = 15 * 60 // sözel bölüm 50 soru / 75 dk → 10 soruya 15 dk
export const REPAIR_PER_UNIT = 5
export const REPAIR_MAX_UNITS = 3

const shuffle = (a, rng) => { const x = [...a]; for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [x[i], x[j]] = [x[j], x[i]] } return x }

/** İfadenin ünitesi kimliğinden okunur (U3-012 → 3); tekrar soruları başka ünitenin gününde durabilir. */
export const unitOfItem = id => { const m = /^U(\d+)-/.exec(id || ''); return m ? +m[1] : null }

/** qIndex'ten ünite → [ifade kimlikleri] (yalnız sorusu olan ifadeler). */
export function itemsByUnit(qIndex) {
  const out = {}
  for (const id of qIndex.keys()) { const u = unitOfItem(id); if (u) (out[u] ||= []).push(id) }
  return out
}

/** Mini LGS: seçilen ünitelerden sırayla (dengeli) LGS tarzı sına sorusu; ifade başına bir soru; önceki denemelerin soruları mümkünse çıkmaz. */
export function pickMini(qIndex, units, { n = MINI_N, exclude = new Set(), rng = Math.random } = {}) {
  const by = itemsByUnit(qIndex)
  const poolFor = id => (qIndex.get(id) || []).filter(q => q.role === 'sina' && q.lgs_like && q.options?.length >= 3)
  const queues = shuffle(units, rng).map(u => shuffle((by[u] || []).filter(id => poolFor(id).length), rng)).filter(q => q.length)
  const take = (id, useExcluded) => {
    const pool = poolFor(id).filter(q => useExcluded || !exclude.has(q.id))
    return pool.length ? { ...pool[Math.floor(rng() * pool.length)], itemId: id } : null
  }
  const out = []
  for (const useExcluded of [false, true]) { // önce yeni sorular; yetmezse eskiler
    const qs = queues.map(q => [...q])
    while (out.length < n && qs.some(q => q.length)) {
      for (const q of qs) {
        if (out.length >= n || !q.length) continue
        const id = q.shift()
        if (out.some(x => x.itemId === id)) continue
        const pick = take(id, useExcluded)
        if (pick) out.push(pick)
      }
    }
    if (out.length >= n) break
  }
  return shuffle(out, rng)
}

/** LGS neti: 3 yanlış 1 doğruyu götürür. */
export const netOf = (d, y) => Math.round((d - y / 3) * 100) / 100
export const fmtNet = x => x.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })

/** answers: soru kimliği → seçilen şık (-1 ya da yok: boş). list: shuffleOptions çıktıları (correctIndex, unit bilgisiyle). */
export function scoreMini(list, answers) {
  const byUnit = {}
  let d = 0, y = 0, b = 0
  for (const q of list) {
    const u = unitOfItem(q.itemId) ?? q.unit
    const r = (byUnit[u] ||= { d: 0, y: 0, b: 0 })
    const a = answers[q.id]
    if (a == null || a < 0) { b++; r.b++ } else if (a === q.correctIndex) { d++; r.d++ } else { y++; r.y++ }
  }
  return { d, y, b, n: list.length, net: netOf(d, y), byUnit }
}

/** Kaybın en çok olduğu üniteler (yanlış önce, sonra boş), en fazla max tane. */
export function weakUnits(byUnit = {}, max = REPAIR_MAX_UNITS) {
  return Object.entries(byUnit)
    .filter(([, r]) => r.y + r.b > 0)
    .sort(([ua, a], [ub, b]) => (b.y - a.y) || (b.b - a.b) || (ua - ub))
    .slice(0, max).map(([u]) => +u)
}

const REPAIR_ROLES = ['review', 'kullan', 'sina', 'retention', 'drill']

/** Tamir seti: her üniteden perUnit ifade, bir soru. Önce yanlış yapılan, sonra kararsız, sonra hiç görülmemiş ifadeler. */
export function pickRepair(qIndex, units, progress, { perUnit = REPAIR_PER_UNIT, rng = Math.random } = {}) {
  const by = itemsByUnit(qIndex)
  const weight = id => {
    const it = progress?.items?.[id]
    if (!it) return 2
    if (it.wrong > 0 && it.status !== 'known') return 0
    if (it.status === 'unc') return 1
    return it.status === 'known' ? 3 : 2
  }
  const out = []
  for (const u of units.slice(0, REPAIR_MAX_UNITS)) {
    const ids = shuffle(by[u] || [], rng).sort((a, b) => weight(a) - weight(b))
    let k = 0
    for (const id of ids) {
      if (k >= perUnit) break
      const pool = (qIndex.get(id) || []).filter(q => REPAIR_ROLES.includes(q.role) && q.options?.length >= 3 && q.type !== 'dinle')
      if (!pool.length) continue
      const rank = q => REPAIR_ROLES.indexOf(q.role)
      const best = Math.min(...pool.map(rank))
      const top = pool.filter(q => rank(q) === best)
      out.push({ itemId: id, role: 'review', unit: u, q: top[Math.floor(rng() * top.length)] })
      k++
    }
  }
  return out
}

/** Son denemelerden kısa özet: son net ve bir öncekine göre fark. */
export function miniTrend(history = []) {
  if (!history.length) return null
  const last = history[history.length - 1], prev = history[history.length - 2]
  return { last: last.net, diff: prev ? Math.round((last.net - prev.net) * 100) / 100 : null, count: history.length }
}
