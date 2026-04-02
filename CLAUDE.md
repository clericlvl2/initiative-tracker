# Initiative Tracker — CLAUDE.md

## What This App Is

A combat initiative tracker for tabletop RPGs (d20/OSR and 13th Age systems). Used by a Dungeon Master at the table to manage turn order, hit points, and conditions during combat encounters. Mobile-first, installable as a PWA, works offline.

---

## User Stories

- As a DM, I can add a combatant (PC or monster) with a name, initiative bonus, rolled initiative, max HP, and system-specific defense stats
- As a DM, I can roll initiative for all unrolled combatants at once (`Roll All`)
- As a DM, I can manually set a combatant's initiative by tapping the init value inline
- As a DM, I can deal damage or healing in preset amounts (1, 2, 3, 5, 10)
- As a DM, I can see a visual HP bar reflecting health state (full / wounded / critical / dead)
- As a DM, I can apply and remove conditions (Blinded, Charmed, Poisoned, etc.)
- As a DM, I can write a short note on a combatant (max 250 chars)
- As a DM, I can duplicate or remove a combatant
- As a DM, I can advance to the next turn; the tracker wraps and increments the round counter
- As a DM, my encounter state persists across page reloads (localStorage)

---

## UX Intent

- **Single combat screen** — a row-based list of combatants, always fully visible, sorted by initiative.
- Each row shows: initiative, name, type badge, HP bar + numbers, defense stats, conditions (if any).
- Tapping a row opens a **bottom drawer** with all controls: DMG/HEAL toggle + 1/2/3/5/10 buttons, conditions, notes, duplicate, remove.
- **Bottom bar:** `[+ Add]` and `[Next Turn →]` / `[Roll All]`. Nothing else.
- No "Start Battle" mode — the list is always live. `[Roll All]` fills missing initiatives only, never overwrites. `[Next Turn →]` appears once ≥1 combatant has initiative.
- Adding mid-fight auto-rolls initiative and slots into correct position.
- The UI should feel like a **physical GM tool** — functional, fast, no decorative friction.

---

## Tech Stack

| Layer         | Technology                            |
|---------------|---------------------------------------|
| Framework     | SvelteKit                             |
| Language      | TypeScript (strict)                   |
| UI components | shadcn-svelte (all components)        |
| Styling       | Tailwind CSS                          |
| State         | svelte-persisted-store (localStorage) |
| Lint/format   | Biome                                 |
| Unit tests    | Vitest + @testing-library/svelte      |
| E2E tests     | Playwright                            |
| Deployment    | Vercel (@sveltejs/adapter-vercel)     |

---

## Folder Structure

```
src/
  entities/
    combatant/
      model/
        combatant.ts        # Combatant types (discriminated union) + store
        combatant.test.ts
        nanoid.ts
      index.ts
    condition/
      model/condition.ts    # D&D condition constants
      index.ts
  pages/
    combat/
      ui/
        CombatPage.svelte
        CombatantRow.svelte
        CombatantDrawer.svelte
        AddCombatantSheet.svelte
        ConditionPickerSheet.svelte
      index.ts
  shared/
    lib/
    ui/
  routes/
    +page.svelte            # Combat page
    +layout.svelte
  app.html
  hooks.client.ts
```

**Path aliases:** `@/pages`, `@/entities`, `@/shared`

**Data model:** see `src/entities/combatant/model/combatant.ts`
— Combatant is a discriminated union: `ClassicCombatant | AgeCombatant`
— Initiative split into `initRoll: number | null` and `initMod: number`
— System profiles: `"classic"` (D&D/OSR — AC only) and `"age"` (13th Age — AC, PD, MD)

---

## Code Conventions

- **Svelte 5 runes** — use `$state`, `$derived`, `$effect`. No legacy `writable()` in components.
- **Store pattern** — all mutations go through store methods. Components never mutate state directly.
- **Thin UI layer** — no business logic in `.svelte` files.
- **TypeScript strict** — no `any`, no implicit types. Always narrow `Combatant` union before accessing system-specific fields.
- **Biome** — single tool for lint + format. Run `npm run check` before committing.
- **No dead code** — if it's unused, delete it.
- **shadcn-svelte for everything** — no custom primitives. Themed to warm/parchment color scheme.

---

## Key Commands

```bash
npm run dev          # dev server
npm run build        # production build
npm run preview      # preview production build locally
npm run check        # biome lint + format check (read-only)
npm run lint         # biome lint --write
npm run format       # biome format --write
npm test             # vitest run
npx playwright test  # e2e tests
```

---

## Roadmap

| Step | Status | Description                                                                  |
|------|--------|------------------------------------------------------------------------------|
| 1    | ✅ Done | CLAUDE.md                                                                    |
| 2    | ✅ Done | SvelteKit migration + Playwright setup                                       |
| 3    | ✅ Next | Full combat page rebuild (new data model, shadcn-svelte, row layout, drawer) |
| 4    | ✅ Done | Pre-push git hook (biome + vitest + playwright)                              |
| 5    | ⬜      | Vercel Analytics + Sentry                                                    |
| 6    | ⬜      | Multi-page nav (sidebar, Combat / Library / Settings routes)                 |
| 7    | ⬜      | Monster library (save, browse, pick when adding combatant)                   |
| 8    | ⬜      | Battle templates (save / load encounter from sidebar)                        |
