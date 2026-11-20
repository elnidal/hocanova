// Akşam 20.00 hatırlatması (web push). Sunucu tarafı: worker.js + supabase/push.sql.
import { supabase, ensureSession, enabled } from './supabase.js'

export const VAPID_PUBLIC = 'BF5vKLmRuSj1beAaH3R0nWayjBiDEaFlMjFWLeWTIRDdg5ntocd4p66yoNWmFoMeX9RqtW_miKhPPZYgLT2lloA'

const toBytes = b64 => { const s = atob(b64.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (b64.length % 4)) % 4)); return Uint8Array.from(s, c => c.charCodeAt(0)) }

/** Durum: 'unsupported' | 'ios-install' (iPhone'da önce ana ekrana eklenmeli) | 'denied' | 'off' | 'on' */
export async function pushStatus(nav = globalThis.navigator, win = globalThis.window) {
  if (!enabled || !nav || !win) return 'unsupported'
  const ios = /iPad|iPhone|iPod/.test(nav.userAgent || '') || (nav.platform === 'MacIntel' && nav.maxTouchPoints > 1)
  const standalone = win.matchMedia?.('(display-mode: standalone)').matches || nav.standalone === true
  if (ios && !standalone) return 'ios-install'
  if (!('serviceWorker' in nav) || !('PushManager' in win) || !('Notification' in win)) return 'unsupported'
  if (win.Notification.permission === 'denied') return 'denied'
  const reg = await nav.serviceWorker.getRegistration()
  const sub = await reg?.pushManager.getSubscription()
  return sub && win.Notification.permission === 'granted' ? 'on' : 'off'
}

export async function enablePush() {
  const perm = await Notification.requestPermission()
  if (perm !== 'granted') return perm === 'denied' ? 'denied' : 'off'
  const reg = await navigator.serviceWorker.ready
  const sub = (await reg.pushManager.getSubscription()) || await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: toBytes(VAPID_PUBLIC) })
  const user = await ensureSession()
  const { error } = await supabase.from('push_subs').upsert({ user_id: user.id, endpoint: sub.endpoint, updated_at: new Date().toISOString() })
  if (error) { await sub.unsubscribe(); throw error }
  return 'on'
}

export async function disablePush() {
  const reg = await navigator.serviceWorker.getRegistration()
  const sub = await reg?.pushManager.getSubscription()
  if (sub) await sub.unsubscribe()
  const user = await ensureSession()
  await supabase.from('push_subs').delete().eq('user_id', user.id)
  return 'off'
}
