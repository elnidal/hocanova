// Hoca Nova: gözlüklü, gülümseyen bir yıldız ("nova" = yeni parlayan yıldız). Renkler temadan gelir, koyu modda da okunur.
export default function NovaAvatar({ size = 44 }) {
  return (
    <svg className="nova" width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <rect width="100" height="100" rx="28" className="nova-bg" />
      <polygon className="nova-star" points="50.0,12.0 62.3,37.0 89.9,41.0 70.0,60.5 74.7,88.0 50.0,75.0 25.3,88.0 30.0,60.5 10.1,41.0 37.7,37.0" />
      <circle className="nova-glass" cx="41" cy="52" r="7" />
      <circle className="nova-glass" cx="59" cy="52" r="7" />
      <path className="nova-line" d="M48 52h4" />
      <circle className="nova-eye" cx="41" cy="52" r="2.2" />
      <circle className="nova-eye" cx="59" cy="52" r="2.2" />
      <path className="nova-line" d="M44 63q6 5 12 0" />
      <circle className="nova-cheek" cx="35" cy="62" r="3" />
      <circle className="nova-cheek" cx="65" cy="62" r="3" />
    </svg>
  )
}
