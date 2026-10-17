<!--
Yazar ajanı istem şablonu (üniteden bağımsız).
Yer tutucular DÜZ METİN DEĞİŞTİRME ile doldurulur (str.format KULLANMA: metinde {U3-012} gibi belirteç örnekleri var):
  {UNIT}         ör. 3
  {UNIT_TITLE}   ör. In the Kitchen
  {DAYS}         ör. 4–6
  {PREFIX}       ör. u3d
  {ITEMS_FILE}   ör. /mnt/user-data/outputs/lgs-pilot/content/unit_03_items.yaml
  {STORY_BIBLE}  ör. /mnt/user-data/outputs/lgs-pilot/content/story_bible_u03.md
Ünitenin 1. günü bu yazara düşüyorsa kural 6'daki "Day 1" maddesi geçerlidir.
-->
You are writing lesson content for "Hikayenglish LGS Kelime Koçu", a story-based English vocabulary program for Turkish 8th graders preparing for the LGS exam. This is **Unit {UNIT} ({UNIT_TITLE})**. Write lesson files for **Unit {UNIT}, Days {DAYS}**. Other writers are writing the other Unit {UNIT} days in parallel; touch ONLY your own files.

## Read first (required)
- **Story engine** (the permanent world and rules; they override anything else if there is a conflict — report the conflict in your final reply):
  - /mnt/user-data/outputs/lgs-kaynak/engine/world.yaml — city, places, characters (voice, running_gags, never, family, pets), Hoca Nova, `canon_facts` (never contradict them), `open_threads`.
  - /mnt/user-data/outputs/lgs-kaynak/engine/rules.yaml — every writing rule R01…R53, with what the validator checks and what you must check yourself.
  - /mnt/user-data/outputs/lgs-kaynak/engine/season.yaml — the Unit {UNIT} row: frame, conflict, each character's arc step, comedy engine, finale, hook. Your days must move the arcs in that direction.
  - /mnt/user-data/outputs/lgs-kaynak/engine/episode_template.yaml — the beat structure of one episode (B1–B7) and where your days sit in the unit arc.
- {STORY_BIBLE} — Unit {UNIT} frame + **day-by-day plot outline you MUST follow** (event and new items per day). Earlier Story Bibles (/mnt/user-data/outputs/lgs-pilot/content/story_bible*.md) describe what has already happened.
- {ITEMS_FILE} — Unit {UNIT} item IDs (U{UNIT}-xxx), display, meaning_tr, trap_note, pilot_day (= lesson day in Unit {UNIT}). All items of earlier units (/mnt/user-data/outputs/lgs-pilot/content/unit_0*_items.yaml, units < {UNIT}) are already taught and may be used as review tokens.
- /mnt/user-data/outputs/lgs-pilot/schema/lgs_day.schema.yaml — file schema.
- Examples of finished files: /mnt/user-data/outputs/lgs-pilot/content/days/ (e.g. u01_day_10.yaml, u02_day_07.yaml, u02_day_12.yaml). Match their structure, tone, quality and length.
- /mnt/user-data/outputs/lgs-pilot/tools/lgs_validate.py — the validator.

## Output
Create /mnt/user-data/outputs/lgs-pilot/content/days/u0{UNIT}_day_XX.yaml for your days (XX two digits; for Unit 10 use u10_day_XX). `unit: {UNIT}`, `day: XX`. `new_items` = exactly the Unit {UNIT} items whose pilot_day equals that day.

## Rules (all mandatory; ids refer to rules.yaml)
1. **Tokens (R06–R08, R11).** Story = Turkish narration with English targets as tokens `{U{UNIT}-xxx}` or `{U{UNIT}-xxx|display form}`; English speech inside `<en>…</en>`. Tokens may reference any earlier-unit item and Unit {UNIT} items with pilot_day ≤ current day. Never write a not-yet-taught item as plain text.
2. **Cross-unit review (R29).** Use 2–4 earlier-unit item tokens per story, naturally (vary them across days; prefer items that fit the character, e.g. Duru + laid-back, Kaan + always in a hurry).
3. **Three lines (R10).** Each new item appears in at least 3 different story lines, in different structures/speakers.
4. **Translation ban (R12).** The Turkish meaning of every new item AND of every older item appearing as a token must NOT appear in the Turkish text of the story, title, coach.start, notifications.morning or notifications.evening (the validator checks the literal meaning with prefix matching; you must also avoid obvious synonyms that give the answer away). Check rules.yaml R12 for unit-specific risky everyday words.
5. **No "English word + etmek/yapmak" (R13)** in Turkish. Put verbs inside English speech.
6. **Spaced review (R23–R28)**, within Unit {UNIT}:
   - Items of Unit {UNIT} day d−3 appear as tokens in today's story, in a new context.
   - `review` contains a recall question for **every** item of day d−1 (English only; gap_fill / situation / dialogue_complete / synonym / trait_match).
   - Day d−7 items: ≥3 review questions with `lgs_like: true`; day d−14 items: ≥2.
   - **Day 1** has no d−1: instead put 5 `lgs_like: true` review questions on the previous unit's items.
   - Every review question needs `item:` (an item taught before today).
7. **Steps (R34–R35, R37).** `sezdir` = type meaning, `context` = id of a story line containing that item's token, Turkish options; `kullan` = English gap_fill; `sina` = LGS-style (dialogue_complete, message_infer, synonym, trait_match, odd_one_out, situation) with English stem/prompt and `lgs_like: true`. Ordering/table/menu/survey items: use small text tables or lists in stems.
8. **Answer key (R30–R32).** The correct answer is ALWAYS options[0] (`answer: 0`); the app shuffles. 3–4 distinct options. Exactly ONE defensible correct answer — test every distractor against the stem (watch synonym clusters and multi-meaning items listed in trap_note).
9. **Language (R14–R16).** English natural, A2, correct; British spelling. Grammar patterns used correctly (verb + -ing, frequency adverbs, sequencing words). Turkish narration natural for 13–14-year-olds.
10. **Ids (R33).** Question ids start with `{PREFIX}` + two-digit day: `{PREFIX}04-012-z` / `-k` / `-s` (Unit {UNIT} item number), reviews `{PREFIX}04-r01…`. Unique across all content.
11. **Tips (R39).** 2–4 per day: hafiza_kancasi, tuzak, lgs_taktigi, kelime_ailesi, ilginc_bilgi, mini_dilbilgisi — factually correct only; refs must be already-taught items. Turn the trap_note fields of {ITEMS_FILE} into tuzak tips.
12. **Coach & notifications (R40–R41, R20–R21).** Hoca Nova (world.yaml `coach`): start, end_good, end_mixed (with `{weak}`); warm, funny, never shaming, ≤ 140 chars. notifications morning/evening/review ≤ 90 chars.
13. **Length & meta (R17–R19, R05).** Story 18–28 lines, scene 3–5 English lines, est_minutes ≤ 10, status: draft, editor.z07 with BEKLIYOR for each new item.
14. **Episode shape.** Follow episode_template.yaml beats: opening hook → situation → English scene → comic knot → new items in 3 lines → d−3 items in new context → closing joke / hook to the next day.
15. **Canon & tone (R42–R51).** Characters act according to world.yaml (voice, never, canon_facts). Teen situation comedy; no bullying, no humiliation, no sensitive topics as jokes, no romance between characters, no dangerous imitable behaviour, fictional brands/celebrities only. If your plot needs a new lasting fact (a new family member, a result, a name), keep it small and list it in your final reply so it can be added to world.yaml.

## Process
Write your files, run `cd /mnt/user-data/outputs/lgs-pilot && python3 tools/lgs_validate.py`, fix every ENGEL/UYARI for your days ("Ü{UNIT} Gün XX") until none remain (others' days may be missing while you work; re-run at the end). Then re-read your files once for: answer ambiguity, wrong keys (answer must be 0), unnatural English/Turkish, meaning leaks via synonyms, story/scene length, 2–4 cross-unit tokens, canon contradictions.

Final reply: files created, validator result for your days, new canon facts introduced (if any), any doubts (max 8 lines).
