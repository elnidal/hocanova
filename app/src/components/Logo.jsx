import NovaAvatar from './NovaAvatar.jsx'

// HikayEnglish: üç renkli yazı logosu ("Hikay" koyu, "E" mercan + altın parıltı, "nglish" mavi). big=true: renkli büyük sürüm.
export default function Logo({ big = false }) {
  return (
    <span className={`logo${big ? ' big' : ''}`} aria-label="HikayEnglish">
      <span className="lg-a">Hikay</span><b>E</b><span className="lg-c">nglish</span>
    </span>
  )
}

// Baykuş + yazı logosu + alt satır: ana ekran başlığı. h1 olarak okunur.
export function LogoLockup() {
  return (
    <div className="lockup">
      <NovaAvatar size={56} />
      <div>
        <h1 className="lockup-word"><Logo big /></h1>
        <div className="lockup-tag">LGS Kelime Koçu</div>
      </div>
    </div>
  )
}
