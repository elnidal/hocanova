// Hoca Nova: gözlüklü, bilge ama sevimli bir baykuş. Zemin temadan gelir; baykuşun renkleri sabittir, açık ve koyu modda da okunur.
export default function NovaAvatar({ size = 44 }) {
  return (
    <svg className="nova" width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <rect width="100" height="100" rx="28" className="nova-bg"/>
      <polygon points="22,40 27,14 42,30" fill="#9A6236"/>
      <polygon points="78,40 73,14 58,30" fill="#9A6236"/>
      <ellipse cx="50" cy="60" rx="31" ry="32" fill="#9A6236"/>
      <ellipse cx="50" cy="74" rx="18" ry="15" fill="#F3D9B1"/>
      <path d="M43 72q3 3 6 0M51 72q3 3 6 0M47 80q3 3 6 0" fill="none" stroke="#C9A27A" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="38" cy="50" r="11" fill="#fff" stroke="#1B1E3A" strokeWidth="3"/>
      <circle cx="62" cy="50" r="11" fill="#fff" stroke="#1B1E3A" strokeWidth="3"/>
      <path d="M49 49h2" stroke="#1B1E3A" strokeWidth="3" strokeLinecap="round"/>
      <circle cx="39" cy="51" r="4.5" fill="#1B1E3A"/>
      <circle cx="61" cy="51" r="4.5" fill="#1B1E3A"/>
      <circle cx="40.5" cy="49.3" r="1.4" fill="#fff"/>
      <circle cx="62.5" cy="49.3" r="1.4" fill="#fff"/>
      <polygon points="45.5,60 54.5,60 50,67" fill="#FFC93C" stroke="#E0A419" strokeWidth="1" strokeLinejoin="round"/>
    </svg>
  )
}
