// Yerel ve uzak durum çakışması: son kaydeden (savedAt) kazanır; uzak boşsa yerel gönderilir.
export function chooseSync(local, remote) {
  if (!remote) return 'push'
  const l = local?.savedAt || 0, r = remote.savedAt || 0
  if (r > l) return 'hydrate'
  if (r < l) return 'push'
  return 'same'
}
