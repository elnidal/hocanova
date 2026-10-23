// Öğretmen paneli veri erişimi: öğrenci oturumundan AYRI bir Supabase istemcisi (oturum yalnız bu sekmede, sessionStorage).
import { createClient } from '@supabase/supabase-js'

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
