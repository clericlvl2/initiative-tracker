import { persisted } from "svelte-persisted-store";
import { get } from "svelte/store";
import { nanoid } from "./nanoid";

export type CombatantType = "pc" | "monster";

export interface Combatant {
	id: string;
	name: string;
	initiative: number | null;
	modifier: number;
	type: CombatantType;
	maxHp: number;
	currentHp: number;
	ac: number | null;
	conditions: string[];
	notes: string;
	isExpanded: boolean;
}

export interface EncounterState {
	combatants: Combatant[];
	currentTurnIndex: number;
	round: number;
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
	if (a.initiative === null && b.initiative === null) return 0;
	if (a.initiative === null) return 1;
	if (b.initiative === null) return -1;
	return b.initiative - a.initiative;
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
			modifier: number;
			type: CombatantType;
			maxHp: number;
			ac: number | null;
		}) {
			update((s) => ({
				...s,
				combatants: [
					...s.combatants,
					{
						id: nanoid(),
						name: params.name,
						initiative: null,
						modifier: params.modifier,
						type: params.type,
						maxHp: params.maxHp,
						currentHp: params.maxHp,
						ac: params.ac,
						conditions: [],
						notes: "",
						isExpanded: false,
					},
				].sort(sortByInitiative),
			}));
		},

		rollAllUnrolledInitiatives() {
			update((s) => ({
				...s,
				combatants: s.combatants
					.map((c) =>
						c.initiative === null
							? { ...c, initiative: Math.floor(Math.random() * 20) + 1 + c.modifier }
							: c,
					)
					.sort(sortByInitiative),
			}));
		},

		setInitiative(id: string, initiative: number) {
			update((s) => ({
				...s,
				combatants: s.combatants
					.map((c) => (c.id === id ? { ...c, initiative } : c))
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
						if (!isNaN(suffix) && suffix > maxSuffix) maxSuffix = suffix;
					}
				}
				const copy: Combatant = {
					...source,
					id: nanoid(),
					name: `${baseName} ${maxSuffix + 1}`,
					initiative: null,
					currentHp: source.maxHp,
					conditions: [],
					notes: "",
					isExpanded: false,
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

		toggleExpanded(id: string) {
			update((s) => ({
				...s,
				combatants: s.combatants.map((c) =>
					c.id === id ? { ...c, isExpanded: !c.isExpanded } : c,
				),
			}));
		},

		collapseAll() {
			update((s) => ({
				...s,
				combatants: s.combatants.map((c) => ({ ...c, isExpanded: false })),
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
