// Öğretmen paneli veri erişimi: öğrenci oturumundan AYRI bir Supabase istemcisi (oturum yalnız bu sekmede, sessionStorage).
import { createClient } from '@supabase/supabase-js'
import { isMissingRpc, makeClassCode } from './classCode.js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY
export const teacherEnabled = Boolean(url && key)
export const tclient = teacherEnabled
  ? createClient(url, key, { auth: { storageKey: 'hikayenglish-teacher', storage: typeof sessionStorage !== 'undefined' ? sessionStorage : undefined, autoRefreshToken: true, persistSession: true } })
  : null

export async function teacherLogin(email, password) {
  const { error } = await tclient.auth.signInWithPassword({ email, password })
  if (error) throw error
  const { data, error: e2 } = await tclient.rpc('is_teacher')
  if (e2) throw e2
  if (!data) { await tclient.auth.signOut(); throw new Error('Bu hesap öğretmen olarak tanımlı değil (teacher.sql 3. adım).') }
}
export const teacherSession = async () => (await tclient.auth.getSession()).data.session
export const teacherLogout = () => tclient.auth.signOut()

const call = async fn => { const { data, error } = await tclient.rpc(fn); if (error) throw error; return data || [] }
export const loadStudents = () => call('teacher_students')
export const loadWords = () => call('teacher_words')
export const loadReports = () => call('teacher_reports').catch(() => []) // reports tablosu henüz kurulmamış olabilir
export const loadClasses = () => call('teacher_classes').catch(() => null) // class_goal.sql henüz kurulmamış olabilir
export async function saveClass(code, name, goal) {
  const { error } = await tclient.rpc('teacher_class_save', { p_code: code, p_name: name, p_goal: goal })
  if (error) throw error
}

const randomUnit = () => {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const buf = new Uint32Array(1)
    crypto.getRandomValues(buf)
    return buf[0] / 4294967296
  }
  return Math.random()
}

/** Sunucu kodu üretir. class_goal_codes.sql yoksa tarayıcıda üretir ve legacy: true döner. */
export async function createClass(name, goal) {
  const { data, error } = await tclient.rpc('teacher_class_create', { p_name: name, p_goal: goal })
  if (!error) return { code: data, legacy: false }
  if (!isMissingRpc(error)) throw error
  const code = makeClassCode(name, randomUnit)
  await saveClass(code, name, goal)
  return { code, legacy: true }
}

export async function rotateClass(code) {
  const { data, error } = await tclient.rpc('teacher_class_rotate', { p_code: code })
  if (error) throw error
  return data
}

/** Yeni kod işlevi var mı? Boş kod yazmaz; 'bu kod senin sınıfın değil' işlevin durduğunu gösterir. */
export async function classSecurityReady() {
  const { error } = await tclient.rpc('teacher_class_rotate', { p_code: '' })
  if (!error) return true
  return !isMissingRpc(error)
}
