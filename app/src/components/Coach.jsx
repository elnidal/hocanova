import NovaAvatar from './NovaAvatar.jsx'

export default function Coach({ text, name = 'Hoca Nova' }) {
  return (
    <div className="coach">
      <NovaAvatar />
      <div className="say-bubble"><small>{name}</small>{text}</div>
    </div>
  )
}
