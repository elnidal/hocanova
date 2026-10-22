import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { createProgress, setLevel, recordAnswer, applyUnitCheck } from './engine'
import { enabled, supabase, ensureSession, fetchRemote, pushRemote } from './supabase.js'
import { chooseSync } from './sync.js'
import { getCaptchaToken } from './captcha.js'
import { countAnswer, DEFAULT_GOAL } from './goal.js'

const KEY = 'hikayenglish.lgs.app.v1'

export const localAdapter = {
  load() { try { return JSON.parse(localStorage.getItem(KEY)) } catch { return null } },
  save(s) { try { localStorage.setItem(KEY, JSON.stringify(s)) } catch { /* özel mod vb. */ } },
}

const initial = () => ({ progress: createProgress(), placement: null, unit: 1, doneDays: {}, unitChecks: {}, retentions: {}, profile: null, hintSeen: {}, daily: {}, goal: DEFAULT_GOAL, savedAt: 0 })

function reducer(s, a) {
  if (a.type === 'hydrate') return { ...initial(), ...a.state }
  const next = apply(s, a)
  return next === s ? s : { ...next, savedAt: a.stamp ?? next.savedAt }
}

function apply(s, a) {
  switch (a.type) {
    case 'placement': return { ...s, placement: { ...a.result, at: a.now }, progress: setLevel(s.progress, a.result.level) }
    case 'answer': return { ...s, progress: recordAnswer(s.progress, a.payload), daily: countAnswer(s.daily, a.payload.now) }
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

export function useStore() {
  const [state, rawDispatch] = useReducer(reducer, null, () => ({ ...initial(), ...(localAdapter.load() || {}) }))
  const dispatch = useCallback(a => rawDispatch({ ...a, stamp: Date.now() }), [])
  const [sync, setSync] = useState({ status: enabled ? 'connecting' : 'off', email: null, error: null })
  const ready = useRef(false)
  const latest = useRef(state)
  latest.current = state

  useEffect(() => { localAdapter.save(state) }, [state])

  const connect = useCallback(async () => {
    if (!enabled) return
    ready.current = false
    try {
      const user = await ensureSession()
      const remote = await fetchRemote(user.id)
      const action = chooseSync(latest.current, remote)
      if (action === 'hydrate') rawDispatch({ type: 'hydrate', state: remote })
      else if (action === 'push') await pushRemote(user.id, latest.current)
      ready.current = true
      setSync({ status: user.is_anonymous ? 'anon' : 'user', email: user.email ?? null, error: null })
    } catch (e) { setSync({ status: 'error', email: null, error: e.message }) }
  }, [])
  useEffect(() => { connect() }, [connect])

  // Her değişiklikten ~1,5 sn sonra uzağa yaz (hazır olmadan yazma: uzaktaki veriyi ezmemek için).
  useEffect(() => {
    if (!enabled || !ready.current) return
    const t = setTimeout(async () => {
      try {
        const { data } = await supabase.auth.getUser()
        await pushRemote(data.user.id, latest.current)
      } catch (e) { setSync(s => ({ ...s, status: 'error', error: e.message })) }
    }, 1500)
    return () => clearTimeout(t)
  }, [state.savedAt])

  const account = {
    enabled, ...sync,
    // Üyeliksiz oturumu e-posta + şifreyle kalıcı hesaba çevirir (ilerleme aynı kalır).
    async signUp(email, password) {
      const { error } = await supabase.auth.updateUser({ email, password })
      if (error) throw error
      await connect()
    },
    // Başka cihazdan mevcut hesaba girer; uzaktaki ilerleme (daha yeniyse) yüklenir.
    async signIn(email, password) {
      const captchaToken = await getCaptchaToken()
      const { error } = await supabase.auth.signInWithPassword({ email, password, ...(captchaToken && { options: { captchaToken } }) })
      if (error) throw error
      await connect()
    },
    async signOut() {
      await supabase.auth.signOut()
      rawDispatch({ type: 'hydrate', state: initial() })
      localAdapter.save(initial())
      await connect()
    },
  }
  return [state, dispatch, account]
}
