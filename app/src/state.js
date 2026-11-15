// Öğrenci durumu. React ve ağ yok: reducer saf, test edilir.
import { createProgress, setLevel, recordAnswer, recordFlash, applyUnitCheck } from './engine/index.js'
import { countAnswer, DEFAULT_GOAL } from './goal.js'

export const initial = () => ({
  progress: createProgress(), placement: null, unit: 1, doneDays: {}, unitChecks: {},
  retentions: {}, profile: null, hintSeen: {}, daily: {}, goal: DEFAULT_GOAL, savedAt: 0,
})

/** Eski kayıt yeni alanlar olmadan da açılır; gelen alanlar ezilmez. */
export function hydrate(saved) {
  if (!saved || typeof saved !== 'object') return initial()
  return { ...initial(), ...saved }
}

export function apply(s, a) {
  switch (a.type) {
    case 'placement': return { ...s, placement: { ...a.result, at: a.now }, progress: setLevel(s.progress, a.result.level) }
    case 'answer': return { ...s, progress: recordAnswer(s.progress, a.payload), daily: countAnswer(s.daily, a.payload.now) }
    case 'flash': return { ...s, progress: recordFlash(s.progress, a), daily: countAnswer(s.daily, a.now) }
    case 'examQ': return { ...s, daily: countAnswer(s.daily, a.now) }
    case 'examDone': return { ...s, examDone: { ...(s.examDone || {}), [a.id]: { ok: a.ok, n: a.n, at: a.now } } }
    case 'unitQuiz': return { ...s, unitQuiz: { ...(s.unitQuiz || {}), [a.unit]: { ...(s.unitQuiz?.[a.unit] || {}), [a.phase]: a.result } } }
    case 'miniLgs': return { ...s, miniLgs: [...(s.miniLgs || []), a.result].slice(-30) }
    case 'repairDone': return { ...s, repairs: [...(s.repairs || []), { units: a.units, ok: a.ok, n: a.n, at: a.now }].slice(-50) }
    case 'weekly': return { ...s, weekly: { ...(s.weekly || {}), [a.key]: a.result } }
    case 'onboarded': return { ...s, onboarded: true }
    case 'parentToken': return { ...s, parentToken: a.token }
    case 'goal': return { ...s, goal: a.goal }
    case 'dayDone': return { ...s, doneDays: { ...s.doneDays, [a.key]: { first: a.first, total: a.total, n: a.n, at: a.now } } }
    case 'retentionDone': return { ...s, retentions: { ...(s.retentions || {}), [`u${a.unit}:${a.id}`]: { ok: a.ok, n: a.n, at: a.now } } }
    case 'reviewDone': return { ...s, reviews: [...(s.reviews || []), { first: a.first, total: a.total, at: a.now }].slice(-200) }
    case 'unitCheck': {
      const { unit, ...p } = a.payload
      const known = Object.values(p.verified).filter(Boolean).length
      return { ...s, progress: applyUnitCheck(s.progress, p), unitChecks: { ...(s.unitChecks || {}), [unit]: { fakes: p.fakes, claimed: p.claimed.length, verified: known, at: p.now } } }
    }
    case 'skipUnitCheck': return { ...s, unitChecks: { ...(s.unitChecks || {}), [a.unit]: { skipped: true, at: a.now } } }
    case 'hint': return { ...s, hintSeen: { ...(s.hintSeen || {}), [a.key]: (s.hintSeen?.[a.key] || 0) + 1 } }
    case 'profile': return { ...s, profile: a.profile }
    case 'unit': return { ...s, unit: a.unit }
    case 'reset': return initial()
    default: return s
  }
}
