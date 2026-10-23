// "Sorun bildir": bildirimi Supabase'e yollar; bağlantı/oturum yoksa yerelde sıraya koyar, sonra yollar.
import { enabled, supabase, ensureSession } from './supabase.js'
import { KINDS, cleanReport } from './reportsCore.js'

const KEY = 'hikayenglish.lgs.reports.v1'
export { KINDS, cleanReport }

const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || [] } catch { return [] } }
const save = list => { try { localStorage.setItem(KEY, JSON.stringify(list.slice(-50))) } catch { /* özel mod */ } }

export const pendingCount = () => load().length

/** Sıradaki bildirimleri yollar; başarısız olanlar sırada kalır. */
export async function flushReports() {
  if (!enabled) return 0
  const list = load()
  if (!list.length) return 0
  try { await ensureSession() } catch { return 0 }
  const left = []
  for (const r of list) {
    const { error } = await supabase.from('reports').insert(r)
    if (error) left.push(r)
  }
  save(left)
  return list.length - left.length
}

export async function sendReport(input) {
  const r = cleanReport(input)
  if (!r) return false
  save([...load(), r])
  flushReports().catch(() => {})
  return true
}
