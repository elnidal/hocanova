const cache = {}
const base = import.meta.env.BASE_URL
const get = path => fetch(`${base}content/${path}`).then(r => { if (!r.ok) throw new Error(path); return r.json() })

export const loadIndex = () => (cache.index ??= get('index.json'))
export const loadUnit = n => (cache[`u${n}`] ??= get(`unit_${String(n).padStart(2, '0')}.json`))

// Tekrar sorusu seçimi için günü olan tüm ünitelerin içeriği (ders başlarken yüklenir).
export const loadAllUnits = index => Promise.all(index.units.filter(u => u.dayCount).map(u => loadUnit(u.unit)))

// Sınav Dili ek dersi (24 ders): ilk açıldığında yüklenir.
export const loadExamCourse = () => (cache.exam ??= get('exam_course.json'))
