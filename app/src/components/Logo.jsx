import NovaAvatar from './NovaAvatar.jsx'

// Hoca Nova: üç renkli yazı logosu ("Hoca" koyu, "N" mercan + altın parıltı, "ova" mavi). big=true: renkli büyük sürüm.
export default function Logo({ big = false }) {
  return (
    <span className={`logo${big ? ' big' : ''}`} aria-label="Hoca Nova">
      <span className="lg-a">Hoca&nbsp;</span><b>N</b><span className="lg-c">ova</span>
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
        <div className="lockup-tag">LGS İngilizce</div>
      </div>
    </div>
  )
}
