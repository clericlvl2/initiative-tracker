import { get } from "svelte/store";
import { persisted } from "svelte-persisted-store";
import { nanoid } from "./nanoid";

export type CombatantType = "pc" | "monster";
export type CombatantSystem = "classic" | "age";

interface CombatantBase {
	id: string;
	name: string;
	type: CombatantType;
	initRoll: number | null;
	initMod: number;
	maxHp: number;
	currentHp: number;
	ac: number | null;
	conditions: string[];
	notes: string;
}

export interface ClassicCombatant extends CombatantBase {
	system: "classic";
}

export interface AgeCombatant extends CombatantBase {
	system: "age";
	pd: number;
	md: number;
}

export type Combatant = ClassicCombatant | AgeCombatant;

export interface EncounterState {
	combatants: Combatant[];
	currentTurnIndex: number;
	round: number;
}

export function initTotal(c: Combatant): number | null {
	return c.initRoll !== null ? c.initRoll + c.initMod : null;
}

const DEFAULT_STATE: EncounterState = {
	combatants: [],
	currentTurnIndex: 0,
	round: 1,
};

function clampHp(value: number, max: number): number {
	return Math.max(0, Math.min(value, max));
}

function sortByInitiative(a: Combatant, b: Combatant): number {
	const ta = initTotal(a);
	const tb = initTotal(b);
	if (ta === null && tb === null) return 0;
	if (ta === null) return 1;
	if (tb === null) return -1;
	return tb - ta;
}

function createEncounterStore() {
	const store = persisted<EncounterState>("initiative-tracker", DEFAULT_STATE);

	function update(fn: (state: EncounterState) => EncounterState) {
		store.update(fn);
	}

	return {
		subscribe: store.subscribe,

		addCombatant(params: {
			name: string;
			system: CombatantSystem;
			type: CombatantType;
			initMod: number;
			maxHp: number;
			ac: number | null;
			pd?: number;
			md?: number;
		}) {
			update((s) => {
				const battleStarted = s.combatants.some((c) => c.initRoll !== null);
				const initRoll = battleStarted
					? Math.floor(Math.random() * 20) + 1
					: null;

				const base: CombatantBase = {
					id: nanoid(),
					name: params.name,
					type: params.type,
					initRoll,
					initMod: params.initMod,
					maxHp: params.maxHp,
					currentHp: params.maxHp,
					ac: params.ac,
					conditions: [],
					notes: "",
				};

				const combatant: Combatant =
					params.system === "age"
						? {
								...base,
								system: "age",
								pd: params.pd ?? 10,
								md: params.md ?? 10,
							}
						: { ...base, system: "classic" };

				return {
					...s,
					combatants: [...s.combatants, combatant].sort(sortByInitiative),
				};
			});
		},

		rollAllUnrolledInitiatives() {
			update((s) => ({
				...s,
				combatants: s.combatants
					.map((c) =>
						c.initRoll === null
							? { ...c, initRoll: Math.floor(Math.random() * 20) + 1 }
							: c,
					)
					.sort(sortByInitiative),
			}));
		},

		setInitiative(id: string, total: number) {
			update((s) => ({
				...s,
				combatants: s.combatants
					.map((c) => (c.id === id ? { ...c, initRoll: total - c.initMod } : c))
					.sort(sortByInitiative),
			}));
		},

		duplicateCombatant(id: string) {
			update((s) => {
				const source = s.combatants.find((c) => c.id === id);
				if (!source) return s;
				const baseName = source.name.replace(/ \d+$/, "");
				let maxSuffix = 1;
				for (const c of s.combatants) {
					if (c.name === baseName || c.name.startsWith(`${baseName} `)) {
						const suffix = parseInt(c.name.slice(baseName.length).trim(), 10);
						if (!Number.isNaN(suffix) && suffix > maxSuffix) maxSuffix = suffix;
					}
				}
				const copy: Combatant = {
					...source,
					id: nanoid(),
					name: `${baseName} ${maxSuffix + 1}`,
					initRoll: null,
					currentHp: source.maxHp,
					conditions: [],
					notes: "",
				};
				return {
					...s,
					combatants: [...s.combatants, copy].sort(sortByInitiative),
				};
			});
		},

		removeCombatant(id: string) {
			update((s) => {
				const removedIndex = s.combatants.findIndex((c) => c.id === id);
				const combatants = s.combatants.filter((c) => c.id !== id);
				let currentTurnIndex = s.currentTurnIndex;
				if (removedIndex < currentTurnIndex) {
					currentTurnIndex -= 1;
				}
				currentTurnIndex = Math.min(
					currentTurnIndex,
					Math.max(0, combatants.length - 1),
				);
				return { ...s, combatants, currentTurnIndex };
			});
		},

		nextTurn() {
			update((s) => {
				if (s.combatants.length === 0) return s;
				const next = s.currentTurnIndex + 1;
				const isNewRound = next >= s.combatants.length;
				return {
					...s,
					currentTurnIndex: isNewRound ? 0 : next,
					round: isNewRound ? s.round + 1 : s.round,
				};
			});
		},

		applyDamage(id: string, amount: number) {
			update((s) => ({
				...s,
				combatants: s.combatants.map((c) =>
					c.id === id
						? { ...c, currentHp: clampHp(c.currentHp - amount, c.maxHp) }
						: c,
				),
			}));
		},

		applyHeal(id: string, amount: number) {
			update((s) => ({
				...s,
				combatants: s.combatants.map((c) =>
					c.id === id
						? { ...c, currentHp: clampHp(c.currentHp + amount, c.maxHp) }
						: c,
				),
			}));
		},

		addCondition(id: string, condition: string) {
			update((s) => ({
				...s,
				combatants: s.combatants.map((c) =>
					c.id === id && !c.conditions.includes(condition)
						? { ...c, conditions: [...c.conditions, condition] }
						: c,
				),
			}));
		},

		removeCondition(id: string, condition: string) {
			update((s) => ({
				...s,
				combatants: s.combatants.map((c) =>
					c.id === id
						? {
								...c,
								conditions: c.conditions.filter((cond) => cond !== condition),
							}
						: c,
				),
			}));
		},

		setNote(id: string, note: string) {
			update((s) => ({
				...s,
				combatants: s.combatants.map((c) =>
					c.id === id ? { ...c, notes: note } : c,
				),
			}));
		},

		resetEncounter() {
			store.set(DEFAULT_STATE);
		},

		getCurrentTurn(): Combatant | undefined {
			const state = get(store);
			return state.combatants[state.currentTurnIndex];
		},
	};
}

export const encounterStore = createEncounterStore();
