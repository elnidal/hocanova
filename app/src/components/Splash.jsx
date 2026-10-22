import Logo from './Logo.jsx'

// Açılış / bekleme ekranı: logo + Hoca Nova + üç nokta. index.html içindeki ilk boyama ile aynı yapıdadır.
export default function Splash({ text = 'Hoca Nova hazırlanıyor…' }) {
  return (
    <div className="splash" role="status">
      <div className="splash-logo"><Logo /></div>
      <div className="splash-n" aria-hidden="true">N</div>
      <p className="muted">{text}</p>
      <div className="dots3" aria-hidden="true"><i /><i /><i /></div>
    </div>
  )
}
