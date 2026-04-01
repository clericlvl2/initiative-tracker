<script lang="ts">
	import { encounterStore } from "@/entities/combatant";
	import AddCombatantSheet from "./AddCombatantSheet.svelte";
	import CombatantCard from "./CombatantCard.svelte";
	import ConditionPickerSheet from "./ConditionPickerSheet.svelte";

	let state = $derived($encounterStore);
	let showAddSheet = $state(false);
	let conditionTargetId = $state<string | null>(null);

	let hasUnrolled = $derived(
		state.combatants.length > 0 &&
			state.combatants.some((c) => c.initiative === null),
	);

	function handleNextTurn() {
		encounterStore.nextTurn();
	}

	function handleStartBattle() {
		encounterStore.rollAllUnrolledInitiatives();
	}

	function handleClear() {
		if (confirm("Clear encounter and start fresh?")) {
			encounterStore.resetEncounter();
		}
	}

	function handleCardTap(id: string) {
		const s = $encounterStore;
		const activeCombatant = s.combatants[s.currentTurnIndex];
		if (activeCombatant?.id === id) return;
		encounterStore.toggleExpanded(id);
	}
</script>

<div class="layout">
	<!-- Top bar -->
	<header class="top-bar">
		<span class="app-name">D20 Planner</span>
		<div class="round-chip" aria-live="polite" aria-label="Round {state.round}">
			<span class="round-lbl">Round</span>
			<span class="round-num">{state.round}</span>
		</div>
		<button class="end-btn" onclick={handleClear} aria-label="Clear encounter">Clear</button>
	</header>

	<!-- Combatant list -->
	<main class="list" role="list" aria-label="Combatants">
		{#if state.combatants.length === 0}
			<div class="empty-state">
				<p class="empty-title">No combatants yet</p>
				<p class="empty-hint">Tap "Add" to begin the encounter</p>
			</div>
		{:else}
			{#each state.combatants as combatant, i (combatant.id)}
				<div role="listitem">
					<CombatantCard
						{combatant}
						isActive={i === state.currentTurnIndex}
						onTap={() => handleCardTap(combatant.id)}
						onAddCondition={() => (conditionTargetId = combatant.id)}
					/>
				</div>
			{/each}
		{/if}
	</main>

	<!-- Bottom bar -->
	<footer class="bottom-bar">
		<button class="add-btn" onclick={() => (showAddSheet = true)} aria-label="Add combatant">
			+ Add
		</button>
		{#if hasUnrolled}
			<button class="action-btn battle" onclick={handleStartBattle}>
				⚔ Start Battle
			</button>
		{:else}
			<button
				class="action-btn"
				onclick={handleNextTurn}
				disabled={state.combatants.length === 0}
				aria-label="Next turn"
			>
				Next Turn →
			</button>
		{/if}
	</footer>
</div>

<!-- Add combatant sheet -->
{#if showAddSheet}
	<AddCombatantSheet onClose={() => (showAddSheet = false)} />
{/if}

<!-- Condition picker sheet -->
{#if conditionTargetId !== null}
	<ConditionPickerSheet
		combatantId={conditionTargetId}
		onClose={() => (conditionTargetId = null)}
	/>
{/if}

<style>
	.layout {
		display: flex;
		flex-direction: column;
		height: 100dvh;
		max-width: 600px;
		margin: 0 auto;
		position: relative;
	}

	@media (min-width: 640px) {
		.layout {
			margin: 28px auto;
			height: calc(100dvh - 56px);
			border-radius: 20px;
			border: 1px solid var(--border);
			box-shadow: 0 4px 20px rgba(24, 19, 14, 0.10), 0 12px 48px rgba(24, 19, 14, 0.08);
			overflow: hidden;
		}
	}

	/* Top bar */
	.top-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16px 18px 13px;
		background: var(--surface);
		border-bottom: 1px solid var(--border);
		flex-shrink: 0;
	}

	.app-name {
		font-family: var(--font-serif);
		font-size: 16px;
		font-weight: 700;
		color: var(--text);
		letter-spacing: -0.02em;
	}

	.round-chip {
		display: flex;
		align-items: baseline;
		gap: 6px;
		background: var(--bg);
		border: 1px solid var(--border);
		border-radius: 100px;
		padding: 5px 14px;
	}

	.round-lbl {
		font-size: 10px;
		font-weight: 600;
		letter-spacing: 0.09em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.round-num {
		font-family: var(--font-mono);
		font-size: 18px;
		font-weight: 500;
		color: var(--text);
		line-height: 1;
	}

	.end-btn {
		font-size: 12px;
		font-weight: 500;
		color: var(--text-muted);
		background: transparent;
		border: 1px solid var(--border);
		padding: 7px 13px;
		border-radius: 8px;
		transition: color 0.15s, border-color 0.15s;
	}

	.end-btn:hover {
		color: var(--accent);
		border-color: var(--border-acc);
	}

	/* List */
	.list {
		flex: 1;
		overflow-y: auto;
		padding: 10px 10px 4px;
		overscroll-behavior: contain;
		display: flex;
		flex-direction: column;
	}

	.list::-webkit-scrollbar {
		width: 3px;
	}

	.list::-webkit-scrollbar-track {
		background: transparent;
	}

	.list::-webkit-scrollbar-thumb {
		background: var(--border-hi);
		border-radius: 2px;
	}

	/* Empty state — fills flex parent, centers content */
	.empty-state {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 6px;
		text-align: center;
		padding: 24px;
	}

	.empty-title {
		font-family: var(--font-serif);
		font-size: 18px;
		font-weight: 600;
		color: var(--text-muted);
	}

	.empty-hint {
		font-size: 13px;
		color: var(--text-muted);
	}

	/* Bottom bar */
	.bottom-bar {
		display: flex;
		gap: 10px;
		padding: 10px 12px 28px;
		background: var(--surface);
		border-top: 1px solid var(--border);
		flex-shrink: 0;
	}

	.add-btn {
		font-size: 14px;
		font-weight: 600;
		color: var(--text-mid);
		background: var(--bg);
		border: 1px solid var(--border);
		height: 48px;
		flex: 1;
		border-radius: 12px;
		transition: all 0.15s;
	}

	.add-btn:hover {
		border-color: var(--border-hi);
		color: var(--text);
	}

	.action-btn {
		font-size: 14px;
		font-weight: 600;
		color: #ffffff;
		background: var(--text);
		border: 1px solid transparent;
		height: 48px;
		border-radius: 12px;
		flex: 1;
		transition: background 0.15s, transform 0.1s;
	}

	.action-btn.battle {
		background: #3a2a1a;
	}

	.action-btn:hover:not(:disabled) {
		background: #2a241e;
	}

	.action-btn.battle:hover {
		background: #4a3828;
	}

	.action-btn:active:not(:disabled) {
		transform: scale(0.97);
	}

	.action-btn:disabled {
		opacity: 0.4;
	}

	/* Focus rings */
	:global(*:focus-visible) {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
	}
</style>
