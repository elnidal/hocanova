import { useState } from 'react'
import { LogoLockup } from '../components/Logo.jsx'
import { extractToken } from '../parentShare.js'

// #giris: öğrenci dışındaki girişler tek yerde (öğretmen: tahta + panel, veli: kodla rapor).
export default function Giris() {
  const [code, setCode] = useState('')
  const [err, setErr] = useState('')
  const openParent = e => {
    e.preventDefault()
    const t = extractToken(code)
    if (!t) return setErr('Bağlantı ya da kod tanınmadı. Öğrencinin "Veli raporu → Bağlantı oluştur" ile verdiği bağlantının tamamını yapıştırın.')
    location.hash = `veli=${t}`
  }
  return (
    <div className="wrap">
      <LogoLockup />
      <h1>Kim giriyor?</h1>

      <a className="card role" href="#">
        <span><b>Öğrenciyim</b><span className="muted small">Derslere, tekrara ve Mini LGS'ye devam et.</span></span>
        <span aria-hidden="true">→</span>
      </a>

      <section className="card">
        <div className="role-head"><b>Öğretmenim</b></div>
        <a className="card role sub" href="#tahta">
          <span><b>Tahta modu</b><span className="muted small">Sınıfta akıllı tahtada ders aç. Giriş yok, kayıt yok; üniteler arasında serbest gezinti.</span></span>
          <span aria-hidden="true">→</span>
        </a>
        <a className="card role sub" href="#ogretmen">
          <span><b>Öğretmen paneli</b><span className="muted small">Öğrencilerinin ilerlemesi. E-posta ve şifreyle giriş.</span></span>
          <span aria-hidden="true">→</span>
        </a>
      </section>

      <section className="card">
        <div className="role-head"><b>Veliyim</b></div>
        <p className="muted small">Çocuğunuzun ilerlemesini görürsünüz; hiçbir şey değiştiremezsiniz. Öğrenci uygulamada <b>Veli raporu → Bağlantı oluştur</b> der ve size bağlantıyı gönderir. Bağlantıya dokunmanız yeter; ya da buraya yapıştırın:</p>
        <form className="row" onSubmit={openParent}>
          <input className="field" value={code} onChange={e => { setCode(e.target.value); setErr('') }} placeholder="Bağlantı ya da kod" aria-label="Veli bağlantısı ya da kodu" autoComplete="off" />
          <button className="btn" disabled={!code.trim()}>Raporu aç</button>
        </form>
        {err && <p className="small no-line">{err}</p>}
      </section>
    </div>
  )
}
