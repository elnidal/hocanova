import { useEffect, useState } from 'react'
import { pushStatus, enablePush, disablePush } from '../push.js'

// Akşam 20.00 hatırlatması: yalnız o gün hiç çalışmadıysan gelir. compact: Hesabım içinde tek satır.
export default function ReminderCard({ compact = false }) {
  const [st, setSt] = useState(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  useEffect(() => { pushStatus().then(setSt).catch(() => setSt('unsupported')) }, [])
  if (!st || st === 'unsupported' || (!compact && st !== 'off')) return null
  const act = async fn => { setBusy(true); setErr(''); try { setSt(await fn()) } catch { setErr('Şu an açılamadı; biraz sonra tekrar dene.') } setBusy(false) }
  return (
    <section className={compact ? 'reminder compact' : 'card reminder'} aria-label="Akşam hatırlatması">
      {!compact && <div className="eyebrow">Hatırlatma</div>}
      {st === 'on' && <p className="small"><b>Akşam hatırlatması açık.</b> O gün çalışmadıysan 20.00'de tek bir bildirim gelir. <button className="linkbtn inline" disabled={busy} onClick={() => act(disablePush)}>kapat</button></p>}
      {st === 'off' && <>
        <p className="small"><b>Akşam 20.00'de hatırlatayım mı?</b> Yalnız o gün hiç çalışmadıysan, günde en fazla bir bildirim.</p>
        <button className="btn sm" disabled={busy} onClick={() => act(enablePush)}>{busy ? 'Açılıyor…' : 'Hatırlat'}</button>
      </>}
      {st === 'denied' && <p className="muted small">Bildirim izni kapalı. Açmak için tarayıcı ya da telefon ayarlarından bu siteye bildirim izni ver.</p>}
      {st === 'ios-install' && <p className="muted small">iPhone'da hatırlatma için önce Paylaş → <b>Ana Ekrana Ekle</b>, sonra uygulamayı ana ekrandan aç.</p>}
      {err && <p className="softnote">{err}</p>}
    </section>
  )
}
