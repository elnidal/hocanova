// Pilot için öğrenci tanıma bilgisi: takma ad (zorunlu) + sınıf kodu (isteğe bağlı). Gerçek ad şart değil.
export const NICK_MAX = 24
export const GROUP_MAX = 12

export function cleanProfile({ nick = '', group = '' }) {
  return {
    nick: String(nick).replace(/\s+/g, ' ').trim().slice(0, NICK_MAX),
    group: String(group).replace(/\s+/g, '').toUpperCase().slice(0, GROUP_MAX),
  }
}

export const isValidProfile = p => p.nick.length >= 2
