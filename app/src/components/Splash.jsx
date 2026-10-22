import Logo from './Logo.jsx'
import NovaAvatar from './NovaAvatar.jsx'

// Açılış / bekleme ekranı: logo + Hoca Nova + üç nokta. index.html içindeki ilk boyama ile aynı yapıdadır.
export default function Splash({ text = 'Hoca Nova hazırlanıyor…' }) {
  return (
    <div className="splash" role="status">
      <div className="splash-logo"><Logo /></div>
      <NovaAvatar size={64} />
      <p className="muted">{text}</p>
      <div className="dots3" aria-hidden="true"><i /><i /><i /></div>
    </div>
  )
}
