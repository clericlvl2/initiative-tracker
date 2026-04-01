import { fireEvent, render, screen } from "@testing-library/svelte";
import { afterEach, describe, expect, it, vi } from "vitest";
import { encounterStore } from "@/entities/combatant";
import type { Combatant } from "@/entities/combatant";
import CombatantCard from "./CombatantCard.svelte";

const base: Combatant = {
	id: "test-id-1",
	name: "Goblin",
	initiative: 15,
	modifier: 2,
	type: "monster",
	maxHp: 10,
	currentHp: 7,
	ac: 13,
	conditions: [],
	notes: "",
	isExpanded: false,
};

function renderCard(overrides: Partial<Combatant> = {}, isActive = false) {
	return render(CombatantCard, {
		combatant: { ...base, ...overrides },
		isActive,
		onTap: vi.fn(),
		onAddCondition: vi.fn(),
	});
}

afterEach(() => {
	vi.restoreAllMocks();
});

describe("CombatantCard", () => {
	it("C-1: renders the combatant name", () => {
		renderCard();
		expect(screen.getByText("Goblin")).toBeInTheDocument();
	});

	it("C-2: shows current and max HP", () => {
		const { container } = renderCard();
		expect(container.querySelector(".cur")).toHaveTextContent("7");
		expect(container.querySelector(".hp-nums")).toHaveTextContent("7/10");
	});

	it("C-3: clicking a damage button calls applyDamage on the store", () => {
		const spy = vi.spyOn(encounterStore, "applyDamage");
		const { container } = renderCard({}, true); // isActive=true → expanded
		const valBtns = container.querySelectorAll(".vbtn");
		fireEvent.click(valBtns[0]!); // first button = −1
		expect(spy).toHaveBeenCalledWith("test-id-1", 1);
	});

	it("C-4: clicking the mode toggle switches from DMG to HEAL", () => {
		renderCard({}, true);
		expect(screen.getByText("DMG")).toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", { name: /toggle damage\/heal/i }));
		expect(screen.getByText("HEAL")).toBeInTheDocument();
	});

	it("C-5: in heal mode, clicking a value button calls applyHeal", () => {
		const spy = vi.spyOn(encounterStore, "applyHeal");
		const { container } = renderCard({}, true);
		// switch to heal mode
		fireEvent.click(screen.getByRole("button", { name: /toggle damage\/heal/i }));
		const valBtns = container.querySelectorAll(".vbtn");
		fireEvent.click(valBtns[0]!); // first button = +1
		expect(spy).toHaveBeenCalledWith("test-id-1", 1);
	});

	it("C-6: clicking + Condition fires the onAddCondition callback", () => {
		const onAddCondition = vi.fn();
		render(CombatantCard, {
			combatant: base,
			isActive: true,
			onTap: vi.fn(),
			onAddCondition,
		});
		fireEvent.click(screen.getByText("+ Condition"));
		expect(onAddCondition).toHaveBeenCalledOnce();
	});

	it("C-7: renders a condition pill for each active condition", () => {
		renderCard({ conditions: ["Poisoned", "Stunned"] }, true);
		expect(screen.getByText("Poisoned")).toBeInTheDocument();
		expect(screen.getByText("Stunned")).toBeInTheDocument();
	});

	it("C-8: clicking × on a condition pill calls removeCondition", () => {
		const spy = vi.spyOn(encounterStore, "removeCondition");
		renderCard({ conditions: ["Poisoned"] }, true);
		fireEvent.click(screen.getByRole("button", { name: /remove poisoned/i }));
		expect(spy).toHaveBeenCalledWith("test-id-1", "Poisoned");
	});
});
