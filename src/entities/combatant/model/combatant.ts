import { persisted } from "svelte-persisted-store";
import { get } from "svelte/store";
import { nanoid } from "./nanoid";

export type CombatantType = "pc" | "monster";

export interface Combatant {
	id: string;
	name: string;
	initiative: number;
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

function rollD20(): number {
	return Math.floor(Math.random() * 20) + 1;
}

function clampHp(value: number, max: number): number {
	return Math.max(0, Math.min(value, max));
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
			initiative: number | null;
			type: CombatantType;
			maxHp: number;
			ac: number | null;
		}) {
			const initiative =
				params.initiative ?? rollD20() + params.modifier;
			update((s) => ({
				...s,
				combatants: [
					...s.combatants,
					{
						id: nanoid(),
						name: params.name,
						initiative,
						modifier: params.modifier,
						type: params.type,
						maxHp: params.maxHp,
						currentHp: params.maxHp,
						ac: params.ac,
						conditions: [],
						notes: "",
						isExpanded: false,
					},
				].sort((a, b) => b.initiative - a.initiative),
			}));
		},

		removeCombatant(id: string) {
			update((s) => {
				const combatants = s.combatants.filter((c) => c.id !== id);
				const currentTurnIndex = Math.min(
					s.currentTurnIndex,
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
