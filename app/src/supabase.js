import { createClient } from '@supabase/supabase-js'
import { getCaptchaToken } from './captcha.js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY
export const enabled = Boolean(url && key)
export const supabase = enabled ? createClient(url, key) : null

// Oturum yoksa üyeliksiz (anonim) oturum açar; öğrenci sonra e-posta ekleyip hesabı kalıcı yapabilir.
export async function ensureSession() {
  const { data: { session } } = await supabase.auth.getSession()
  if (session) return session.user
  const captchaToken = await getCaptchaToken()
  const { data, error } = await supabase.auth.signInAnonymously(captchaToken ? { options: { captchaToken } } : undefined)
  if (error) throw error
  return data.user
}

export async function fetchRemote(uid) {
  const { data, error } = await supabase.from('progress').select('state').eq('user_id', uid).maybeSingle()
  if (error) throw error
  return data?.state ?? null
}

export async function pushRemote(uid, state) {
  const { error } = await supabase.from('progress').upsert({ user_id: uid, state, updated_at: new Date().toISOString() })
  if (error) throw error
}
