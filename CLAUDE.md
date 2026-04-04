# Combat Planner — CLAUDE.md

## What This App Is

A combat planner for tabletop RPGs (d20 systems). Used by a Dungeon Master at the table to manage turn order, hit points, and conditions during combat encounters. Mobile-first, installable as a PWA, works offline.

---

## User Stories

- As a DM, I can add a combatant with a following parameters
  - Name.
    - Required
    - Placeholder: "Namius Name"
  - Initiative bonus
    - Not Required
    - Placeholder: 0
    - Default: 0
  - Max HP (Hit Points)
    - Required
    - Placeholder 10
  - AC (Armor Class)
    - Required
    - Placeholder 10
  - PD (Physical Defence)
    - Required
    - Placeholder 10
  - MD (Mental Defence)
    - Required
    - Placeholder 10
  - Text note
    - Not Required
    - Placeholder: "Useful notes..."
    - Default: ""
- As a DM, I can see a newly created combatant in a combatants list with a following parameters
  - Name
  - Initiative. For new combatants equals "-" sign
  - Current HP. For new combatants equals to Max HP
  - Max HP
  - Combatant health bar
  - AC
  - PD
  - MD
  - Text note (if any)
  - + Text note button (if no text note)
  - + Condition button
  - Duplicate button
  - Remove button
- As a DM, I can manually set a combatant's initiative by tapping the value
- As a DM, I can roll initiative for all unrolled combatants at once. Formula: d20 + initiative bonus. List re-sorts immediately after rolling.
- As a DM, I can see all combatants sorted by initiative from highest to lowest. Tiebreaker: higher initiative bonus wins; if still tied, original add order. Combatants with no initiative ("-") always appear at the bottom in original add order.
- As a DM, I can change combatant current HP (heal or damage) in preset amounts (1, 3, 5, 10) by tapping dedicated control buttons. Current HP can go below 0.
- As a DM, I can see a visual HP bar reflecting health state (look "Lists" section)
- As a DM, I can apply conditions to a combatant using preset list (look "Lists" section). Each condition is unique per combatant. A combatant can have up to all 12 conditions at once.
- As a DM, I can remove conditions on a combatant. Conditions never auto-expire; removal is always manual.
- As a DM, I can add, edit or remove text note on a combatant. Notes are edited inline on the combatant card.
- As a DM, I can duplicate a combatant. Naming follows Windows-style suffix — "Goblin", "Goblin 1", "Goblin 2", etc. Duplicate state: initiative reset to "-", HP reset to max, conditions cleared, note copied. Placed at the bottom of the list.
- As a DM, I can remove a combatant. If the removed combatant is the active turn, turn advances to the next combatant automatically.
- As a DM, I can clear the entire combat to start fresh. Requires a confirmation prompt.
- As a DM, I can see current combat round counter (1, 2, 3, 4, ...). Counter is hidden until at least one combatant is added, then always shows starting at Round 1.
- As a DM, I can edit combat round counter manually by tapping
- As a DM, I can see which combatant's turn at the moment
- As a DM, I can move turn to next combatant
- As a DM, when it's last combatant turn and I advance to the next turn, the turn goes to first combatant and round counter increments (1 -> 2, 2 -> 3, ...)
- As a DM, I can use Combat Planner app on mobile, tablet and desktop using web browser
- As a DM, my Combat Planner app data persists across page reloads

## Lists

- Health States (by current HP %):
  - **full** — 100%
  - **wounded** — 50–99%
  - **bloodied** — 1–49%
  - **dead** — 0 or below (visual label only; combatant stays in turn order)
- Conditions: charmed, confused, dazed, fear, helpless, hindered, shocked, stuck, stunned, vulnerable, weakened, staggered

## Constraints

- Notes length: up to 250 characters
- Initiative bonus: from -99 to 99
- Initiative value (manual): from -99 to 999
- AC limits: from 0 to 99
- MD limits: from 0 to 99
- PD limits: from 0 to 99
- HP limits: -999 to 999
- Combat round counter limits: from 1 to 99

---

## Tech Stack

| Layer         | Technology                        |
|---------------|-----------------------------------|
| Framework     | SvelteKit                         |
| Language      | TypeScript                        |
| UI components | shadcn-svelte                     |
| Styling       | Tailwind CSS                      |
| State         | svelte-persisted-store            |
| Lint/format   | Biome                             |
| Unit tests    | Vitest + @testing-library/svelte  |
| E2E tests     | Playwright                        |
| Deployment    | Vercel (@sveltejs/adapter-vercel) |

---

## Folder Structure

```
src/
  entities/
    combatant/
      model/
        combatant.ts
        combatant.test.ts
        nanoid.ts
      index.ts
    condition/
      model/condition.ts
      index.ts
  pages/
    combat/
      ui/
        CombatPage.svelte (Empty)
      index.ts
  shared/
    lib/
    ui/
  routes/
    +page.svelte
    +layout.svelte
  app.html
  hooks.client.ts
```

**Path aliases:** `@/pages`, `@/entities`, `@/shared`

---

## Code Conventions

- **Svelte 5 runes** — use `$state`, `$derived`, `$effect`. No legacy `writable()` in components.
- **Store pattern** — all mutations go through store methods. Components never mutate state directly.
- **Thin UI layer** — no business logic in `.svelte` files.
- **TypeScript strict** — no `any`, no implicit types
- **Biome** — single tool for lint + format. Run `npm run check` before committing.
- **No dead code** — if it's unused, delete it.

---

## Key Commands

```bash
npm run dev          # dev server
npm run build        # production build
npm run preview      # preview production build locally
npm run check        # biome lint + format check (read-only)
npm run lint         # biome lint --write
npm run format       # biome format --write
npm run test         # vitest run
npx playwright test  # e2e tests
```

---

## Roadmap

| Step | Description                                                  |
|------|--------------------------------------------------------------|
| 1    | Creatures library (save, browse, pick when adding combatant) |
| 2    | Encounter presets (save / load ready to go encounter)        |
