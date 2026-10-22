// Soru kökleri için Türkçe yönlendirme satırı. Saf fonksiyon; arayüz zamanla gizler (bkz. HINT_FADE_AFTER).
export const HINT_FADE_AFTER = 5

export const STEM_TR = {
  S01: 'Aşağıdakilerden hangisi diyaloğu tamamlar?',
  S02: 'Aşağıdakilerden hangisinin cevabı metinde yoktur?',
  S03: 'Aşağıdakilerden hangisinden metinde bahsedilmemiştir?',
  S04: 'Metne göre aşağıdakilerden hangisi doğrudur?',
  S05: 'Metin için en iyi başlık hangisidir? / Metin ne hakkındadır?',
  S06: 'Tabloya / grafiğe göre aşağıdakilerden hangisi doğrudur?',
  S07: 'İlk / sonraki / son adım nedir? Adımları doğru sıraya koy.',
  S08: 'Kim …? (Kim müsait? Kim hoşlanır?)',
  S09: 'Aşağıdakilerden hangisi bu durumun bir örneğidir?',
  S10: 'Bu durumda ne söylenmeli? Hangisi doğru ya da uygun?',
  S11: 'Neden arıyor / yazıyor? Mesajın amacı nedir?',
  S12: 'Altı çizili kısmın yerine hangisi gelebilir? / Boşluğa hangisi gelir?',
  S13: 'Eksik soru hangisidir?',
  S14: 'Bu kişi / durum hakkında hangisi çıkarılabilir?',
}

const EXACT = {
  'Choose the best option.': 'En uygun seçeneği seç.',
  'Choose the best option to fill in the blank.': 'Boşluğa en uygun seçeneği seç.',
  'Which one completes the sentence?': 'Hangisi cümleyi tamamlar?',
  'Which one completes the dialogue?': STEM_TR.S01,
  'Which of the following completes the dialogue?': STEM_TR.S01,
  'Which sentence is correct?': 'Hangi cümle doğrudur?',
  'Which question can be the missing question?': STEM_TR.S13,
  'Which of the following is the missing question?': STEM_TR.S13,
  'Put the steps in the correct order.': 'Adımları doğru sıraya koy.',
}

const DATIVE = { text: 'Metne', message: 'Mesaja', dialogue: 'Diyaloğa', notice: 'Duyuruya', recipe: 'Tarife', table: 'Tabloya', chart: 'Grafiğe', 'survey results': 'Anket sonuçlarına', advertisement: 'İlana', brochure: 'Broşüre', poster: 'Afişe', programme: 'Programa', information: 'Bilgiye', invitation: 'Davetiyeye' }

export const normPrompt = t => String(t ?? '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
const isTurkish = t => /[çğıöşüÇĞİÖŞÜâîû]/.test(t) || /\b(ne anlama|ne demek|hangisi|boşluğa|seç)\b/i.test(t)

/** {key, text} ya da null. Önce q.prompt_tr, sonra birebir eşleşme, kurallar, son olarak stem_id. */
export function hintFor(q) {
  const raw = normPrompt(q.prompt)
  if (q.prompt_tr) return { key: `tr:${q.prompt_tr}`, text: q.prompt_tr }
  if (!raw || isTurkish(raw)) return null
  const pick = text => (text ? { key: `p:${raw}`, text } : null)
  if (EXACT[raw]) return pick(EXACT[raw])
  let m
  if (/NOT mentioned/i.test(raw)) return pick(STEM_TR.S03)
  if (/does NOT have an answer/i.test(raw)) return pick(STEM_TR.S02)
  if ((m = /^According to the ([a-z ]+?),? which of the following is (NOT true|TRUE|correct|FALSE)/i.exec(raw))) {
    const who = DATIVE[m[1].toLowerCase()]
    if (who) return pick(`${who} göre aşağıdakilerden hangisi ${/NOT true|FALSE/i.test(m[2]) ? 'doğru DEĞİLDİR' : 'doğrudur'}?`)
  }
  if ((m = /^Which of the following is (?:TRUE|correct) about (\w+)\?/i.exec(raw))) return pick(`${m[1]} hakkında aşağıdakilerden hangisi doğrudur?`)
  if ((m = /^Which (?:word|one) (?:best )?describes (\w+)(?: best)?\?/i.exec(raw))) return pick(`Hangi kelime ${m[1]} için uygundur?`)
  if ((m = /^What does (\w+) mean\?/i.exec(raw))) return pick(`${m[1]} ne demek istiyor?`)
  if (/^(?:Look at the [a-z ]+\. )?Which sentence is (?:TRUE|correct)\?/i.test(raw)) return pick('Hangi cümle doğrudur?')
  if (/^Which (?:of the following |one )?(?:is|are) TRUE(?: about \w+)?\?/i.test(raw)) return pick('Aşağıdakilerden hangisi doğrudur?')
  if (/^Complete the dialogue/i.test(raw)) return pick(STEM_TR.S01)
  if ((m = /^What did (\w+) do\?/i.exec(raw))) return pick(`${m[1]} ne yaptı?`)
  if ((m = /^How does (\w+) feel\?/i.exec(raw))) return pick(`${m[1]} nasıl hissediyor?`)
  if ((m = /^What is (\w+) talking about\?/i.exec(raw))) return pick(`${m[1]} ne hakkında konuşuyor?`)
  if (/^Which one is NOT an? /i.test(raw)) return pick('Hangisi bu gruba ait DEĞİLDİR?')
  if (/letter that we don't say/i.test(raw)) return pick('Hangi kelimede okunmayan bir harf var?')
  if (/replace the underlined|closest in meaning to the underlined/i.test(raw)) return pick('Altı çizili kısmın yerine hangisi gelebilir?')
  if (/CLOSEST meaning|closest in meaning/i.test(raw)) return pick('Anlamca en yakın hangisidir?')
  if (/main idea|best title/i.test(raw)) return pick(STEM_TR.S05)
  if (/NOT describe/i.test(raw)) return pick('Hangi kelime onu anlatmaz?')
  if (q.stem_id && STEM_TR[q.stem_id]) return pick(STEM_TR[q.stem_id])
  return null
}

/** Gösterilme sayısı eşiği geçtiyse satır "TR" düğmesinin arkasına alınır. */
export const hintCollapsed = (seen, key) => (seen?.[key] || 0) >= HINT_FADE_AFTER
