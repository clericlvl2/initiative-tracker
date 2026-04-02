<script lang="ts">
import type { Combatant } from "@/entities/combatant";
import { encounterStore, initTotal } from "@/entities/combatant";

interface Props {
	combatant: Combatant;
	isActive: boolean;
	onTap: () => void;
}

const { combatant, isActive, onTap }: Props = $props();

let editingInit = $state(false);
let initInputVal = $state("");
let initInputEl = $state<HTMLInputElement | null>(null);

const isDead = $derived(combatant.currentHp === 0);
const total = $derived(initTotal(combatant));
const hpPercent = $derived(
	combatant.maxHp > 0
		? Math.round((combatant.currentHp / combatant.maxHp) * 100)
		: 0,
);
const hpColor = $derived(
	hpPercent > 50
		? "var(--hp-full)"
		: hpPercent > 25
			? "var(--hp-mid)"
			: "var(--hp-low)",
);

$effect(() => {
	if (editingInit && initInputEl) {
		initInputEl.focus();
		initInputEl.select();
	}
});

function startEditInit(e: Event) {
	e.stopPropagation();
	initInputVal = total?.toString() ?? "";
	editingInit = true;
}

function commitInit() {
	const val = parseInt(initInputVal, 10);
	if (!Number.isNaN(val)) {
		encounterStore.setInitiative(combatant.id, val);
	}
	editingInit = false;
}
</script>

<div
	class="row"
	class:active={isActive}
	class:dead={isDead}
	role="button"
	tabindex="0"
	onclick={onTap}
	onkeydown={(e) => e.key === "Enter" && onTap()}
	aria-label="{combatant.name}, initiative {total ?? 'unrolled'}, HP {combatant.currentHp}/{combatant.maxHp}"
>
	<!-- Initiative cell -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="init-cell" onclick={(e) => e.stopPropagation()}>
		{#if editingInit}
			<input
				bind:this={initInputEl}
				class="init-input"
				type="number"
				bind:value={initInputVal}
				onblur={commitInit}
				onkeydown={(e) => {
					if (e.key === "Enter") commitInit();
					if (e.key === "Escape") editingInit = false;
				}}
				aria-label="Initiative value"
			/>
		{:else}
			<button
				class="init-btn"
				onclick={startEditInit}
				aria-label="Edit initiative, currently {total ?? 'unrolled'}"
			>
				{total ?? "—"}
			</button>
		{/if}
		<span class="stat-lbl" aria-hidden="true">INIT</span>
	</div>

	<!-- Name + HP -->
	<div class="row-body">
		<div class="row-top">
			<span class="dot" aria-hidden="true"></span>
			<span class="name">{combatant.name}</span>
			<span
				class="badge"
				class:badge-pc={combatant.type === "pc"}
				class:badge-monster={combatant.type === "monster"}
			>
				{combatant.type === "pc" ? "PC" : "MON"}
			</span>
		</div>
		<div class="hp-row">
			<div
				class="hp-track"
				role="progressbar"
				aria-valuenow={hpPercent}
				aria-valuemin={0}
				aria-valuemax={100}
				aria-label="HP {combatant.currentHp} of {combatant.maxHp}"
			>
				<div class="hp-fill" style="width: {hpPercent}%; background: {hpColor};"></div>
			</div>
			<span class="hp-nums" aria-hidden="true">
				<span class="hp-cur">{combatant.currentHp}</span><span class="hp-max">/{combatant.maxHp}</span>
			</span>
		</div>
		{#if combatant.conditions.length > 0}
			<div class="cond-row" aria-label="Active conditions">
				{#each combatant.conditions as cond (cond)}
					<span class="ctag">{cond}</span>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Defense stats -->
	<div class="stats-cell">
		{#if combatant.ac !== null}
			<div class="stat">
				<span class="stat-val">{combatant.ac}</span>
				<span class="stat-lbl">AC</span>
			</div>
		{/if}
		<div class="stat">
			<span class="stat-val">{combatant.pd}</span>
			<span class="stat-lbl">PD</span>
		</div>
		<div class="stat">
			<span class="stat-val">{combatant.md}</span>
			<span class="stat-lbl">MD</span>
		</div>
	</div>
</div>

<style>
	.row {
		display: flex;
		align-items: center;
		gap: 0;
		background: var(--card);
		border-radius: 12px;
		margin-bottom: 6px;
		overflow: hidden;
		box-shadow: 0 1px 4px rgba(24, 19, 14, 0.07);
		cursor: pointer;
		user-select: none;
		outline: none;
		transition: box-shadow 0.15s;
		min-height: 64px;
	}

	.row:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
	}

	.row.active {
		box-shadow: inset 0 0 0 2px var(--accent), 0 2px 10px rgba(24, 19, 14, 0.11);
	}

	.row.dead {
		opacity: 0.38;
	}

	/* Initiative cell */
	.init-cell {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 3px;
		flex-shrink: 0;
		width: 52px;
		padding: 10px 0;
		border-right: 1px solid var(--border);
		align-self: stretch;
	}

	.init-btn {
		font-family: var(--font-mono);
		font-size: 20px;
		font-weight: 500;
		color: var(--text-muted);
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		line-height: 1;
		transition: color 0.15s;
		text-align: center;
		min-width: 32px;
	}

	.init-btn:hover {
		color: var(--text);
	}

	.row.active .init-btn {
		color: var(--text);
	}

	.init-input {
		font-family: var(--font-mono);
		font-size: 16px;
		font-weight: 500;
		color: var(--text);
		background: var(--bg);
		border: 1px solid var(--border-hi);
		border-radius: 6px;
		padding: 2px 4px;
		width: 42px;
		text-align: center;
		outline: none;
	}

	/* Row body */
	.row-body {
		flex: 1;
		min-width: 0;
		padding: 10px 10px 10px 12px;
		display: flex;
		flex-direction: column;
		gap: 5px;
	}

	.row-top {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.dot {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		flex-shrink: 0;
		background: var(--border-hi);
		transition: background 0.2s;
	}

	.row.active .dot {
		background: var(--accent);
		box-shadow: 0 0 0 3px rgba(24, 19, 14, 0.12);
		animation: throb 1.8s ease-in-out infinite;
	}

	@keyframes throb {
		0%, 100% { box-shadow: 0 0 0 3px rgba(24, 19, 14, 0.12); }
		50% { box-shadow: 0 0 0 5px rgba(24, 19, 14, 0.04); }
	}

	.name {
		font-family: var(--font-serif);
		font-size: 15px;
		font-weight: 600;
		color: var(--text);
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.row.dead .name {
		text-decoration: line-through;
		color: var(--text-muted);
	}

	.badge {
		font-size: 9px;
		font-weight: 700;
		letter-spacing: 0.07em;
		text-transform: uppercase;
		padding: 2px 7px;
		border-radius: 4px;
		flex-shrink: 0;
	}

	.badge-pc {
		color: var(--player);
		background: rgba(26, 74, 138, 0.09);
		border: 1px solid rgba(26, 74, 138, 0.22);
	}

	.badge-monster {
		color: var(--monster);
		background: rgba(138, 26, 26, 0.09);
		border: 1px solid rgba(138, 26, 26, 0.22);
	}

	/* HP row */
	.hp-row {
		display: flex;
		align-items: center;
		gap: 7px;
	}

	.hp-track {
		flex: 1;
		height: 6px;
		background: var(--hp-bar-bg);
		border-radius: 3px;
		overflow: hidden;
		min-width: 24px;
	}

	.hp-fill {
		height: 100%;
		border-radius: 3px;
		transition: width 0.3s ease, background 0.3s ease;
	}

	.hp-nums {
		font-family: var(--font-mono);
		font-size: 11px;
		flex-shrink: 0;
		white-space: nowrap;
	}

	.hp-cur {
		font-size: 15px;
		font-weight: 500;
		color: var(--text);
	}

	.hp-max {
		color: var(--text-muted);
	}

	/* Conditions */
	.cond-row {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
	}

	.ctag {
		font-size: 10px;
		font-weight: 500;
		height: 18px;
		padding: 0 6px;
		border-radius: 100px;
		background: rgba(24, 19, 14, 0.06);
		border: 1px solid rgba(24, 19, 14, 0.16);
		color: var(--text-mid);
		display: flex;
		align-items: center;
	}

	/* Defense stats */
	.stats-cell {
		display: flex;
		gap: 6px;
		padding: 10px 12px 10px 8px;
		flex-shrink: 0;
		align-items: center;
		border-left: 1px solid var(--border);
		align-self: stretch;
	}

	.stat {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
		min-width: 26px;
	}

	.stat-val {
		font-family: var(--font-mono);
		font-size: 16px;
		font-weight: 500;
		color: var(--text);
		line-height: 1;
	}

	.stat-lbl {
		font-size: 8px;
		font-weight: 600;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--text-muted);
		line-height: 1;
	}
</style>
