import { useEffect, useReducer } from 'react'
import { createProgress, setLevel, recordAnswer } from './engine'

const KEY = 'hikayenglish.lgs.app.v1'

// Depolama adaptörü: şimdilik tarayıcıda; Supabase eklenince aynı arayüzle (load/save) değiştirilecek.
export const localAdapter = {
  load() { try { return JSON.parse(localStorage.getItem(KEY)) } catch { return null } },
  save(s) { try { localStorage.setItem(KEY, JSON.stringify(s)) } catch { /* özel mod vb. */ } },
  clear() { try { localStorage.removeItem(KEY) } catch { /* yoksay */ } },
}

const initial = () => ({ progress: createProgress(), placement: null, unit: 1, doneDays: {} })

function reducer(s, a) {
  switch (a.type) {
    case 'placement': return { ...s, placement: { ...a.result, at: a.now }, progress: setLevel(s.progress, a.result.level) }
    case 'answer': return { ...s, progress: recordAnswer(s.progress, a.payload) }
    case 'dayDone': return { ...s, doneDays: { ...s.doneDays, [a.key]: { first: a.first, total: a.total, at: a.now } } }
    case 'reviewDone': return { ...s, reviews: [...(s.reviews || []), { first: a.first, total: a.total, at: a.now }].slice(-200) }
    case 'unit': return { ...s, unit: a.unit }
    case 'reset': return initial()
    default: return s
  }
}

export function useStore(adapter = localAdapter) {
  const [state, dispatch] = useReducer(reducer, null, () => ({ ...initial(), ...(adapter.load() || {}) }))
  useEffect(() => { adapter.save(state) }, [state, adapter])
  return [state, dispatch]
}
