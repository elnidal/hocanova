import { createContext } from 'react'
// Türkçe soru satırının kaç kez gösterildiğini tutar; eşik aşılınca satır gizlenir (engine/hints.js).
export const HintCtx = createContext({ seen: {}, bump: () => {} })
