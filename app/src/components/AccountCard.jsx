import { useState } from 'react'

// Yalnız Supabase yapılandırılmışsa görünür.
export default function AccountCard({ account }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState(null)
  const [busy, setBusy] = useState(false)
  if (!account.enabled) return null

  const run = async (fn, ok) => {
    setBusy(true); setMsg(null)
    try { await fn(email.trim(), password); setMsg(ok) } catch (e) { setMsg(e.message) }
    setBusy(false)
  }
  const valid = /\S+@\S+\.\S+/.test(email) && password.length >= 6

  return (
    <section className="card">
      <div className="eyebrow">Hesap</div>
      {account.status === 'user' ? (
        <>
          <p>{account.email} ile giriş yapıldı. İlerlemen hesabında saklanıyor.</p>
          <button className="btn ghost" onClick={() => account.signOut()}>Çıkış yap</button>
        </>
      ) : (
        <>
          <p className="muted small">
            {account.status === 'anon' ? 'İlerlemen kaydediliyor ama başka cihazda açılması için hesap gerekir.'
              : account.status === 'error' ? `Bağlantı sorunu: ${account.error}` : 'Bağlanıyor…'}
          </p>
          <input className="field" type="email" autoComplete="email" placeholder="E-posta" value={email} onChange={e => setEmail(e.target.value)} />
          <input className="field" type="password" autoComplete="current-password" placeholder="Şifre (en az 6 karakter)" value={password} onChange={e => setPassword(e.target.value)} />
          <div className="row">
            <button className="btn" disabled={!valid || busy || account.status !== 'anon'} onClick={() => run(account.signUp, 'Hesap kaydedildi. E-posta onayı isteniyorsa gelen kutunu kontrol et.')}>Hesabı kaydet</button>
            <button className="btn ghost" disabled={!valid || busy} onClick={() => run(account.signIn, 'Giriş yapıldı.')}>Giriş yap</button>
          </div>
          {msg && <p className="small" role="status">{msg}</p>}
        </>
      )}
    </section>
  )
}
