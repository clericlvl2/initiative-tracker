# Combat Planner — CLAUDE.md

## What This App Is

A combat planner for tabletop RPGs (d20 systems). Used by a Dungeon Master at the table to manage turn order, hit points, and conditions during combat encounters. Mobile-first, installable as a PWA, works offline.

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
npm run test         # vitest run
npx playwright test  # e2e tests
```

---

## Roadmap

| Step | Description                                                  |
|------|--------------------------------------------------------------|
| 1    | Creatures library (save, browse, pick when adding combatant) |
| 2    | Encounter presets (save / load ready to go encounter)        |
