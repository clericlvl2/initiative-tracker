import { get } from "svelte/store";
import { beforeEach, describe, expect, it } from "vitest";
import { encounterStore, initTotal } from "./combatant";

// Helper: add a classic monster with minimal required fields
function addMonster(name: string, maxHp = 10, initMod = 0) {
	encounterStore.addCombatant({
		name,
		system: "classic",
		initMod,
		type: "monster",
		maxHp,
		ac: null,
	});
}

// Helper: get the id of a combatant by name
function idOf(name: string): string {
	const found = get(encounterStore).combatants.find((c) => c.name === name);
	if (!found) throw new Error(`Combatant "${name}" not found`);
	return found.id;
}

beforeEach(() => {
	localStorage.clear();
	encounterStore.resetEncounter();
});

// ─────────────────────────────────────────────
// addCombatant
// ─────────────────────────────────────────────
describe("addCombatant", () => {
	it("T-1: stores the combatant in the list", () => {
		addMonster("Goblin");
		const { combatants } = get(encounterStore);
		expect(combatants).toHaveLength(1);
		expect(combatants[0]?.name).toBe("Goblin");
	});

	it("T-2: new combatant starts with initRoll: null", () => {
		addMonster("Goblin");
		expect(get(encounterStore).combatants[0]?.initRoll).toBeNull();
	});

	it("T-3: combatants are sorted by initiative total descending after setInitiative", () => {
		addMonster("A");
		addMonster("B");
		addMonster("C");
		encounterStore.setInitiative(idOf("A"), 5);
		encounterStore.setInitiative(idOf("B"), 15);
		encounterStore.setInitiative(idOf("C"), 10);
		const totals = get(encounterStore)
			.combatants.filter((c) => c.initRoll !== null)
			.map((c) => initTotal(c));
		expect(totals).toEqual([15, 10, 5]);
	});

	it("T-4: new combatant starts with currentHp === maxHp", () => {
		encounterStore.addCombatant({
			name: "Fighter",
			system: "classic",
			initMod: 0,
			type: "pc",
			maxHp: 20,
			ac: 16,
		});
		expect(get(encounterStore).combatants[0]?.currentHp).toBe(20);
	});

	it("T-5: new combatant starts with empty conditions array", () => {
		addMonster("Goblin");
		expect(get(encounterStore).combatants[0]?.conditions).toEqual([]);
	});

	it("T-5b: age combatant stores pd and md", () => {
		encounterStore.addCombatant({
			name: "Mage",
			system: "age",
			initMod: 2,
			type: "monster",
			maxHp: 30,
			ac: 14,
			pd: 12,
			md: 18,
		});
		const c = get(encounterStore).combatants[0];
		expect(c?.system).toBe("age");
		if (c?.system === "age") {
			expect(c.pd).toBe(12);
			expect(c.md).toBe(18);
		}
	});
});

// ─────────────────────────────────────────────
// removeCombatant
// ─────────────────────────────────────────────
describe("removeCombatant", () => {
	it("T-6: removed combatant is no longer in the list", () => {
		addMonster("Goblin");
		encounterStore.removeCombatant(idOf("Goblin"));
		expect(get(encounterStore).combatants).toHaveLength(0);
	});

	it("T-7: currentTurnIndex is clamped when the last combatant is removed", () => {
		addMonster("A");
		addMonster("B");
		encounterStore.nextTurn(); // index → 1
		encounterStore.removeCombatant(idOf("B"));
		expect(get(encounterStore).currentTurnIndex).toBe(0);
	});

	it("T-8: removing a combatant before the active index preserves the active combatant", () => {
		addMonster("A");
		addMonster("B");
		addMonster("C");
		encounterStore.setInitiative(idOf("A"), 20);
		encounterStore.setInitiative(idOf("B"), 10);
		encounterStore.setInitiative(idOf("C"), 5);
		// sorted: [A(20), B(10), C(5)] → index 0 = A active
		encounterStore.nextTurn(); // index 1 → B active
		encounterStore.nextTurn(); // index 2 → C active
		// remove A (index 0, before active index 2)
		encounterStore.removeCombatant(idOf("A"));
		// sorted now: [B(10), C(5)] → C should still be active at index 1
		const s = get(encounterStore);
		expect(s.combatants[s.currentTurnIndex]?.name).toBe("C");
	});
});

// ─────────────────────────────────────────────
// nextTurn
// ─────────────────────────────────────────────
describe("nextTurn", () => {
	it("T-9: currentTurnIndex advances by 1", () => {
		addMonster("A");
		addMonster("B");
		encounterStore.nextTurn();
		expect(get(encounterStore).currentTurnIndex).toBe(1);
	});

	it("T-10: wraps to 0 after the last combatant", () => {
		addMonster("A");
		addMonster("B");
		encounterStore.nextTurn(); // → 1
		encounterStore.nextTurn(); // → wraps to 0
		expect(get(encounterStore).currentTurnIndex).toBe(0);
	});

	it("T-11: round counter increments when wrapping to 0", () => {
		addMonster("A");
		addMonster("B");
		encounterStore.nextTurn();
		encounterStore.nextTurn(); // wrap
		expect(get(encounterStore).round).toBe(2);
	});

	it("T-12: nextTurn on an empty list does nothing", () => {
		encounterStore.nextTurn();
		const s = get(encounterStore);
		expect(s.currentTurnIndex).toBe(0);
		expect(s.round).toBe(1);
	});
});

// ─────────────────────────────────────────────
// applyDamage
// ─────────────────────────────────────────────
describe("applyDamage", () => {
	it("T-13: reduces currentHp by the given amount", () => {
		addMonster("Goblin", 10);
		encounterStore.applyDamage(idOf("Goblin"), 3);
		expect(get(encounterStore).combatants[0]?.currentHp).toBe(7);
	});

	it("T-14: currentHp never goes below 0", () => {
		addMonster("Goblin", 10);
		encounterStore.applyDamage(idOf("Goblin"), 99);
		expect(get(encounterStore).combatants[0]?.currentHp).toBe(0);
	});

	it("T-15: only the targeted combatant's HP changes", () => {
		addMonster("A", 10);
		addMonster("B", 10);
		encounterStore.applyDamage(idOf("A"), 5);
		const b = get(encounterStore).combatants.find((c) => c.name === "B");
		expect(b?.currentHp).toBe(10);
	});
});

// ─────────────────────────────────────────────
// applyHeal
// ─────────────────────────────────────────────
describe("applyHeal", () => {
	it("T-16: increases currentHp by the given amount", () => {
		addMonster("Goblin", 10);
		encounterStore.applyDamage(idOf("Goblin"), 4); // 10 → 6
		encounterStore.applyHeal(idOf("Goblin"), 2); // 6 → 8
		expect(get(encounterStore).combatants[0]?.currentHp).toBe(8);
	});

	it("T-17: currentHp never exceeds maxHp", () => {
		addMonster("Goblin", 10);
		encounterStore.applyHeal(idOf("Goblin"), 99);
		expect(get(encounterStore).combatants[0]?.currentHp).toBe(10);
	});

	it("T-18: only the targeted combatant's HP changes", () => {
		addMonster("A", 10);
		addMonster("B", 10);
		encounterStore.applyDamage(idOf("A"), 5);
		encounterStore.applyHeal(idOf("A"), 3);
		const b = get(encounterStore).combatants.find((c) => c.name === "B");
		expect(b?.currentHp).toBe(10);
	});
});

// ─────────────────────────────────────────────
// addCondition
// ─────────────────────────────────────────────
describe("addCondition", () => {
	it("T-19: condition is added to the combatant's conditions list", () => {
		addMonster("Goblin");
		encounterStore.addCondition(idOf("Goblin"), "Poisoned");
		expect(get(encounterStore).combatants[0]?.conditions).toContain("Poisoned");
	});

	it("T-20: adding the same condition twice does not duplicate it", () => {
		addMonster("Goblin");
		encounterStore.addCondition(idOf("Goblin"), "Poisoned");
		encounterStore.addCondition(idOf("Goblin"), "Poisoned");
		expect(get(encounterStore).combatants[0]?.conditions).toHaveLength(1);
	});
});

// ─────────────────────────────────────────────
// removeCondition
// ─────────────────────────────────────────────
describe("removeCondition", () => {
	it("T-21: condition is removed from the list", () => {
		addMonster("Goblin");
		encounterStore.addCondition(idOf("Goblin"), "Poisoned");
		encounterStore.removeCondition(idOf("Goblin"), "Poisoned");
		expect(get(encounterStore).combatants[0]?.conditions).not.toContain(
			"Poisoned",
		);
	});

	it("T-22: removing a non-existent condition is a no-op", () => {
		addMonster("Goblin");
		expect(() =>
			encounterStore.removeCondition(idOf("Goblin"), "Blinded"),
		).not.toThrow();
		expect(get(encounterStore).combatants[0]?.conditions).toHaveLength(0);
	});
});

// ─────────────────────────────────────────────
// setNote
// ─────────────────────────────────────────────
describe("setNote", () => {
	it("T-23: note is stored on the correct combatant", () => {
		addMonster("A");
		addMonster("B");
		encounterStore.setNote(idOf("A"), "Watch out!");
		const a = get(encounterStore).combatants.find((c) => c.name === "A");
		const b = get(encounterStore).combatants.find((c) => c.name === "B");
		expect(a?.notes).toBe("Watch out!");
		expect(b?.notes).toBe("");
	});
});

// ─────────────────────────────────────────────
// resetEncounter
// ─────────────────────────────────────────────
describe("resetEncounter", () => {
	it("T-24: resets combatants to empty array", () => {
		addMonster("Goblin");
		encounterStore.resetEncounter();
		expect(get(encounterStore).combatants).toHaveLength(0);
	});

	it("T-25: resets currentTurnIndex to 0", () => {
		addMonster("A");
		addMonster("B");
		encounterStore.nextTurn();
		encounterStore.resetEncounter();
		expect(get(encounterStore).currentTurnIndex).toBe(0);
	});

	it("T-26: resets round to 1", () => {
		addMonster("A");
		encounterStore.nextTurn(); // wraps → round 2
		encounterStore.resetEncounter();
		expect(get(encounterStore).round).toBe(1);
	});
});

// ─────────────────────────────────────────────
// initTotal
// ─────────────────────────────────────────────
describe("initTotal", () => {
	it("T-27: returns null when initRoll is null", () => {
		addMonster("Goblin");
		const c = get(encounterStore).combatants[0]!;
		expect(initTotal(c)).toBeNull();
	});

	it("T-28: returns initRoll + initMod as total", () => {
		encounterStore.addCombatant({
			name: "Rogue",
			system: "classic",
			initMod: 3,
			type: "pc",
			maxHp: 20,
			ac: 14,
		});
		encounterStore.setInitiative(idOf("Rogue"), 15); // total=15, so initRoll=15-3=12
		const c = get(encounterStore).combatants.find((c) => c.name === "Rogue")!;
		expect(initTotal(c)).toBe(15);
	});
});
