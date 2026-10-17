import { useState } from 'react'
import { cleanProfile, isValidProfile, NICK_MAX, GROUP_MAX } from '../profile.js'

// Takma ad yoksa dikkat çeken kart; varsa küçük bir satır ("değiştir" ile düzenlenir).
export default function ProfileCard({ profile, onSave }) {
  const [editing, setEditing] = useState(!profile?.nick)
  const [nick, setNick] = useState(profile?.nick || '')
  const [group, setGroup] = useState(profile?.group || '')
  const clean = cleanProfile({ nick, group })

  if (!editing) return (
    <p className="muted small">Takma ad: <b>{profile.nick}</b>{profile.group ? ` · Sınıf: ${profile.group}` : ''} · <button className="linkbtn inline" onClick={() => setEditing(true)}>değiştir</button></p>
  )
  return (
    <section className="card">
      <div className="eyebrow">Seni tanıyalım</div>
      <h3>Takma adın ne olsun?</h3>
      <p className="muted small">Öğretmenin ilerlemeni görebilsin diye. Gerçek adın olmak zorunda değil.</p>
      <input className="field" maxLength={NICK_MAX} placeholder="Takma ad" value={nick} onChange={e => setNick(e.target.value)} />
      <input className="field" maxLength={GROUP_MAX} placeholder="Sınıf kodu (varsa, örn. 8A)" value={group} onChange={e => setGroup(e.target.value)} />
      <button className="btn" disabled={!isValidProfile(clean)} onClick={() => { onSave(clean); setEditing(false) }}>Kaydet</button>
    </section>
  )
}
