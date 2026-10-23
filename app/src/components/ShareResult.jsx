import { useEffect, useState } from 'react'
import { drawCard } from '../shareCard.js'

// "Sonucumu paylaş": kişisel bilgi içermeyen kart (hikâye boyutu). Telefonda paylaşım sayfası, olmazsa indirme.
export default function ShareResult({ kind, title, from, to }) {
  const [blob, setBlob] = useState(null)
  const [url, setUrl] = useState(null)
  const [busy, setBusy] = useState(false)
  useEffect(() => () => url && URL.revokeObjectURL(url), [url])

  const make = async () => {
    setBusy(true)
    try { const b = await drawCard({ kind, title, from, to }); setBlob(b); setUrl(URL.createObjectURL(b)) } finally { setBusy(false) }
  }
  const share = async () => {
    const file = new File([blob], 'hikayenglish-sonuc.png', { type: 'image/png' })
    if (navigator.canShare?.({ files: [file] })) { try { await navigator.share({ files: [file], text: 'HikayEnglish ile LGS kelimelerini çalışıyorum 🦉' }) } catch { /* vazgeçildi */ } return }
    const a = document.createElement('a'); a.href = url; a.download = file.name; a.click()
  }
  return (
    <section className="card sharecard noprint">
      {!url ? (
        <button className="btn ghost" disabled={busy} onClick={make}>{busy ? 'Hazırlanıyor…' : 'Sonucumu paylaş 📸'}</button>
      ) : (
        <>
          <img src={url} alt="Paylaşılabilir sonuç kartı" />
          <button className="btn" onClick={share}>Paylaş / kaydet</button>
          <p className="muted small">Kartta adın ya da başka kişisel bilgin yok.</p>
        </>
      )}
    </section>
  )
}
