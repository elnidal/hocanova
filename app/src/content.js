const cache = {}
const base = import.meta.env.BASE_URL
const get = path => fetch(`${base}content/${path}`).then(r => { if (!r.ok) throw new Error(path); return r.json() })

export const loadIndex = () => (cache.index ??= get('index.json'))
export const loadUnit = n => (cache[`u${n}`] ??= get(`unit_${String(n).padStart(2, '0')}.json`))
