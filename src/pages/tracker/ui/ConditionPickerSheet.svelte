<script lang="ts">
	import { CONDITIONS } from "@/entities/condition";
	import { encounterStore } from "@/entities/combatant";

	interface Props {
		combatantId: string;
		onClose: () => void;
	}

	let { combatantId, onClose }: Props = $props();

	let state = $derived($encounterStore);
	let combatant = $derived(state.combatants.find((c) => c.id === combatantId));
	let activeConditions = $derived(combatant?.conditions ?? []);

	function toggleCondition(condition: string) {
		if (activeConditions.includes(condition)) {
			encounterStore.removeCondition(combatantId, condition);
		} else {
			encounterStore.addCondition(combatantId, condition);
		}
	}

	function handleOverlayClick(e: MouseEvent) {
		if (e.target === e.currentTarget) onClose();
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="overlay" onclick={handleOverlayClick}>
	<div class="sheet">
		<div class="sheet-handle"></div>
		<h2 class="sheet-title">Conditions</h2>
		<div class="cond-grid">
			{#each CONDITIONS as condition}
				<button
					class="cp-btn"
					class:on={activeConditions.includes(condition)}
					onclick={() => toggleCondition(condition)}
				>
					{condition}
				</button>
			{/each}
		</div>
		<button class="done-btn" onclick={onClose}>Done</button>
	</div>
</div>

<style>
	.overlay {
		position: fixed;
		inset: 0;
		background: rgba(18, 14, 10, 0.55);
		display: flex;
		align-items: flex-end;
		z-index: 100;
		backdrop-filter: blur(3px);
		max-width: 600px;
		margin: 0 auto;
	}

	.sheet {
		width: 100%;
		background: var(--surface);
		border-top: 1px solid var(--border);
		border-radius: 22px 22px 0 0;
		padding: 16px 20px 36px;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.sheet-handle {
		width: 38px;
		height: 4px;
		background: var(--border-hi);
		border-radius: 2px;
		align-self: center;
		margin-bottom: 2px;
	}

	.sheet-title {
		font-family: var(--font-serif);
		font-size: 18px;
		font-weight: 700;
		color: var(--text);
	}

	.cond-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 7px;
	}

	.cp-btn {
		height: 44px;
		border-radius: 11px;
		border: 1px solid var(--border);
		background: var(--card);
		font-size: 12px;
		font-weight: 500;
		color: var(--text-mid);
		transition: all 0.14s;
	}

	.cp-btn.on {
		color: var(--text);
		background: rgba(24, 19, 14, 0.07);
		border-color: rgba(24, 19, 14, 0.35);
		font-weight: 600;
	}

	.cp-btn:active {
		transform: scale(0.94);
	}

	.done-btn {
		font-size: 15px;
		font-weight: 600;
		color: #fff;
		background: var(--text);
		border: none;
		height: 50px;
		border-radius: 12px;
		transition: transform 0.1s, background 0.15s;
	}

	.done-btn:hover {
		background: #2a241e;
	}

	.done-btn:active {
		transform: scale(0.97);
	}
</style>
