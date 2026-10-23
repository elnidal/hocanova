import { OWL, OWL_DEFS } from '../owlArt.js'

// Hoca Nova avatarı (tek kaynak: owlArt.js). Zemin degrade, baykuş sabit renkli: açık ve koyu modda aynı görünür.
export default function NovaAvatar({ size = 44 }) {
  return (
    <svg className="nova" width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <g dangerouslySetInnerHTML={{ __html: OWL_DEFS }} />
      <rect width="100" height="100" rx="28" fill="url(#novaBg)" />
      <g dangerouslySetInnerHTML={{ __html: OWL }} />
    </svg>
  )
}
