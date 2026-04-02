# Future Architecture — Steps 6–8

Decisions locked in design sessions. Implement when the step is reached.

---

## Step 6 — Multi-page nav

- Hamburger icon top-left → slide-in sidebar panel
- Sidebar contains: nav links (Combat / Library / Settings) + `[Save Battle]` + `[Load Battle]`
- Bottom bar remains combat-only (`[+ Add]` + `[Next Turn →]`)
- SvelteKit routes: `/` (combat), `/library`, `/settings`
- On desktop: sidebar can be persistent

---

## Step 7 — Monster Library

- Reuses the same `CombatantForm` component as the combat Add drawer
- CRUD: add, edit, delete saved monster definitions
- When adding a combatant in combat: `[From Library]` button in the Add drawer → searchable list → tap to pre-fill form
- Data model: `CombatantTemplate` (see `src/entities/combatant/model/combatant.ts`)
- localStorage key: `combatantTemplates`

---

## Step 8 — Battle Templates

- A battle template is a frozen encounter snapshot — all stats, no runtime state
- Load template → spawns fresh combatants (currentHp = maxHp, initRoll = null, conditions = [], notes = "")
- Then hit `[Roll All]` → fight starts
- Save current encounter as template via sidebar `[Save Battle]`
- Template list filtered by active system profile
- Data model: `BattleTemplate` (see `src/entities/combatant/model/combatant.ts`)
- localStorage key: `battleTemplates`

---

## System Profiles (relevant to all steps)

- App-level setting, stored in `appSettings` localStorage key
- Two profiles: `"classic"` (D&D/OSR — AC) and `"age"` (13th Age — AC, PD, MD)
- Picker in Settings page
- Defense stats are reference-only — not modified mid-combat
- Library and battle template lists are filtered by active system profile
