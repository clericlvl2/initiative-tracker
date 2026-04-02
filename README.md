# Combat Planner

Combat planner for D&D, Pathfinder, OSE, Shadowdark, and other d20 TTRPGs.

**Live:** https://combat-planner.vercel.app

## Features

- Add monsters and players with HP, AC, and initiative bonus
- Roll initiative for all unrolled combatants at once (Start Battle)
- Track HP with a live bar, apply damage and healing
- Conditions picker (Blinded, Charmed, Frightened, etc.)
- Per-combatant notes
- Duplicate combatants for multi-enemy encounters
- State persists across page reloads (localStorage)
- Installable PWA — works offline

## Stack

- Svelte 5 (runes)
- TypeScript
- Vite + vite-plugin-pwa
- svelte-persisted-store
- Deployed on Vercel

## Dev

```bash
npm install
npm run dev
npm test
npm run build
```
