export default function Coach({ text, name = 'Hoca Nova' }) {
  return (
    <div className="coach">
      <div className="avatar" aria-hidden="true">N</div>
      <div className="say-bubble"><small>{name}</small>{text}</div>
    </div>
  )
}
