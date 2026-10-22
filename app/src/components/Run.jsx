import { useMemo, useState } from 'react'
import { shuffleOptions } from '../engine'

// Soru kuyruğu: sırayla gösterir; onResult bir giriş döndürürse kuyruğun sonuna ekler (yanlışı sonda bir kez yeniden sorma).
export default function Run({ list, render, onResult, onEnd }) {
  const [queue, setQueue] = useState(list)
  const [i, setI] = useState(0)
  const entry = queue[i]
  const shuffled = useMemo(() => (entry?.q ? shuffleOptions(entry.q) : null), [entry]) // eslint-disable-line react-hooks/exhaustive-deps
  if (!entry) return null
  const last = i + 1 === queue.length
  return render(entry, shuffled, last,
    picked => { const again = onResult(entry, picked === shuffled.correctIndex, picked, shuffled); if (again) setQueue(q => [...q, again]) },
    () => (last ? onEnd() : setI(i + 1)),
    i, queue)
}
