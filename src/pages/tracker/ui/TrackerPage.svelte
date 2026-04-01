<script lang="ts">
	import { encounterStore } from "@/entities/combatant";
	import AddCombatantSheet from "./AddCombatantSheet.svelte";
	import CombatantCard from "./CombatantCard.svelte";
	import ConditionPickerSheet from "./ConditionPickerSheet.svelte";

	let state = $derived($encounterStore);
	let showAddSheet = $state(false);
	let conditionTargetId = $state<string | null>(null);

	function handleNextTurn() {
		encounterStore.nextTurn();
	}

	function handleClear() {
		if (confirm("Clear encounter and start fresh?")) {
			encounterStore.resetEncounter();
		}
	}

	function handleCardTap(id: string) {
		const s = $encounterStore;
		const activeCombatant = s.combatants[s.currentTurnIndex];
		if (activeCombatant?.id === id) return; // active card always stays expanded
		encounterStore.toggleExpanded(id);
	}

</script>

<div class="layout">
	<!-- Top bar -->
	<header class="top-bar">
		<span class="app-name">Initiative</span>
		<div class="round-chip">
			<span class="round-lbl">Round</span>
			<span class="round-num">{state.round}</span>
		</div>
		<button class="end-btn" onclick={handleClear}>Clear</button>
	</header>

	<!-- Combatant list -->
	<main class="list">
		{#if state.combatants.length === 0}
			<div class="empty-state">
				<p class="empty-title">No combatants yet</p>
				<p class="empty-hint">Tap "Add" to begin the encounter</p>
			</div>
		{:else}
			{#each state.combatants as combatant, i (combatant.id)}
				<CombatantCard
					{combatant}
					isActive={i === state.currentTurnIndex}
					onTap={() => handleCardTap(combatant.id)}
					onAddCondition={() => (conditionTargetId = combatant.id)}
				/>
			{/each}
		{/if}
	</main>

	<!-- Bottom bar -->
	<footer class="bottom-bar">
		<button class="add-btn" onclick={() => (showAddSheet = true)}>+ Add</button>
		<button
			class="next-btn"
			onclick={handleNextTurn}
			disabled={state.combatants.length === 0}
		>
			Next Turn →
		</button>
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

	/* Top bar */
	.top-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20px 18px 15px;
		background: var(--surface);
		border-bottom: 1px solid var(--border);
		flex-shrink: 0;
	}

	.app-name {
		font-family: var(--font-serif);
		font-size: 17px;
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
		padding: 6px 15px;
	}

	.round-lbl {
		font-size: 11px;
		font-weight: 600;
		letter-spacing: 0.09em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.round-num {
		font-family: var(--font-mono);
		font-size: 20px;
		font-weight: 500;
		color: var(--text);
		line-height: 1;
	}

	.end-btn {
		font-size: 13px;
		font-weight: 500;
		color: var(--text-muted);
		background: transparent;
		border: 1px solid var(--border);
		padding: 8px 15px;
		border-radius: 9px;
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
		padding: 12px 12px 4px;
		overscroll-behavior: contain;
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

	/* Empty state */
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 6px;
		padding: 64px 24px;
		text-align: center;
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
		padding: 12px 14px 30px;
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
		height: 54px;
		padding: 0 20px;
		border-radius: 13px;
		flex-shrink: 0;
		transition: all 0.15s;
	}

	.add-btn:hover {
		border-color: var(--border-hi);
		color: var(--text);
	}

	.next-btn {
		font-size: 15px;
		font-weight: 600;
		color: #ffffff;
		background: var(--text);
		border: none;
		height: 54px;
		border-radius: 13px;
		flex: 1;
		letter-spacing: 0.01em;
		transition: background 0.15s, transform 0.1s;
	}

	.next-btn:hover:not(:disabled) {
		background: #2a241e;
	}

	.next-btn:active:not(:disabled) {
		transform: scale(0.97);
	}

	.next-btn:disabled {
		opacity: 0.4;
	}
</style>
