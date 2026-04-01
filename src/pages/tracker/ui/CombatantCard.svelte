<script lang="ts">
	import type { Combatant } from "@/entities/combatant";
	import { encounterStore } from "@/entities/combatant";

	interface Props {
		combatant: Combatant;
		isActive: boolean;
		onTap: () => void;
		onAddCondition: () => void;
	}

	let { combatant, isActive, onTap, onAddCondition }: Props = $props();

	type HpMode = "damage" | "heal";
	let hpMode = $state<HpMode>("damage");
	let editingInit = $state(false);
	let initInputVal = $state("");
	let initInputEl = $state<HTMLInputElement | null>(null);

	const HP_VALUES = [1, 2, 3, 5, 10] as const;

	let isExpanded = $derived(isActive || combatant.isExpanded);
	let isDead = $derived(combatant.currentHp === 0);
	let hpPercent = $derived(
		combatant.maxHp > 0
			? Math.round((combatant.currentHp / combatant.maxHp) * 100)
			: 0,
	);
	let hpColor = $derived(
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
		initInputVal = combatant.initiative?.toString() ?? "";
		editingInit = true;
	}

	function commitInit() {
		const val = parseInt(initInputVal, 10);
		if (!isNaN(val)) {
			encounterStore.setInitiative(combatant.id, val);
		}
		editingInit = false;
	}

	function handleHpButton(value: number) {
		if (hpMode === "damage") {
			encounterStore.applyDamage(combatant.id, value);
		} else {
			encounterStore.applyHeal(combatant.id, value);
		}
	}

	function handleRemoveCondition(condition: string) {
		encounterStore.removeCondition(combatant.id, condition);
	}

	function handleNoteInput(e: Event) {
		const textarea = e.currentTarget as HTMLTextAreaElement;
		textarea.style.height = "auto";
		textarea.style.height = `${textarea.scrollHeight}px`;
		encounterStore.setNote(combatant.id, textarea.value);
	}
</script>

<div
	class="card"
	class:active={isActive}
	class:dead={isDead}
	role="button"
	tabindex="0"
	onclick={onTap}
	onkeydown={(e) => e.key === "Enter" && onTap()}
	aria-expanded={isExpanded}
>
	<!-- Card header (always visible) -->
	<div class="card-hdr">
		<span class="dot"></span>
		<span class="cname">{combatant.name}</span>
		<span class="tbadge" class:player={combatant.type === "pc"} class:monster={combatant.type === "monster"}>
			{combatant.type === "pc" ? "PC" : "Monster"}
		</span>
		{#if editingInit}
			<input
				bind:this={initInputEl}
				class="init-input"
				type="number"
				bind:value={initInputVal}
				onblur={commitInit}
				onkeydown={(e) => { if (e.key === "Enter") commitInit(); if (e.key === "Escape") editingInit = false; }}
				onclick={(e) => e.stopPropagation()}
			/>
		{:else}
			<button class="inum" onclick={startEditInit} aria-label="Edit initiative">
				{combatant.initiative ?? "—"}
			</button>
		{/if}
	</div>

	<!-- HP bar (always visible) -->
	<div class="hp-row">
		<span class="hp-lbl">HP</span>
		<div class="hp-track">
			<div class="hp-fill" style="width: {hpPercent}%; background: {hpColor};"></div>
		</div>
		<span class="hp-nums">
			<span class="cur">{combatant.currentHp}</span>/{combatant.maxHp}
		</span>
	</div>

	{#if isExpanded}
		<!-- HP controls -->
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="hp-ctrl" onclick={(e) => e.stopPropagation()}>
			<button
				class="mode-btn"
				class:damage={hpMode === "damage"}
				class:heal={hpMode === "heal"}
				onclick={() => (hpMode = hpMode === "damage" ? "heal" : "damage")}
				aria-label="Toggle damage/heal mode"
			>
				<span class="mode-btn-sign">{hpMode === "damage" ? "−" : "+"}</span>
				<span class="mode-btn-label">{hpMode === "damage" ? "DMG" : "HEAL"}</span>
			</button>
			<div class="val-btns">
				{#each HP_VALUES as value (value)}
					<button
						class="vbtn"
						class:mode-damage={hpMode === "damage"}
						class:mode-heal={hpMode === "heal"}
						onclick={() => handleHpButton(value)}
					>
						{hpMode === "damage" ? `−${value}` : `+${value}`}
					</button>
				{/each}
			</div>
		</div>

		<!-- AC badge + Stats row -->
		{#if combatant.ac !== null}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div class="stats-row" onclick={(e) => e.stopPropagation()}>
				<div class="stat-badge">
					<span class="stat-num">{combatant.ac}</span>
					<span class="stat-lbl">AC</span>
				</div>
			</div>
		{/if}

		<!-- Conditions -->
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="cond-row" onclick={(e) => e.stopPropagation()}>
			{#each combatant.conditions as condition (condition)}
				<span class="ctag">
					{condition}
					<button
						class="ctag-rm"
						onclick={() => handleRemoveCondition(condition)}
						aria-label="Remove {condition}"
					>×</button>
				</span>
			{/each}
			<button class="add-cond-btn" onclick={onAddCondition}>+ Condition</button>
		</div>

		<!-- Notes -->
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="note-row" onclick={(e) => e.stopPropagation()}>
			<textarea
				class="note-field"
				placeholder="Notes…"
				value={combatant.notes}
				oninput={handleNoteInput}
				rows={1}
			></textarea>
		</div>

		<!-- Card actions -->
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="card-actions" onclick={(e) => e.stopPropagation()}>
			<button class="action-btn" onclick={() => encounterStore.duplicateCombatant(combatant.id)}>
				Duplicate
			</button>
			<button class="action-btn danger" onclick={() => encounterStore.removeCombatant(combatant.id)}>
				Remove
			</button>
		</div>
	{/if}
</div>

<style>
	.card {
		background: var(--card);
		border-radius: 14px;
		border: 1px solid var(--border);
		margin-bottom: 9px;
		overflow: hidden;
		box-shadow: 0 1px 2px rgba(24, 19, 14, 0.04), 0 3px 10px rgba(24, 19, 14, 0.06);
		transition: border-color 0.15s, box-shadow 0.15s;
		cursor: pointer;
		user-select: none;
		outline: none;
	}

	.card.active {
		border-left: 3px solid var(--accent);
		border-color: var(--border-acc);
		box-shadow: 0 2px 6px rgba(24, 19, 14, 0.10), 0 8px 24px rgba(24, 19, 14, 0.09);
	}

	.card.dead {
		opacity: 0.38;
	}

	/* Card header */
	.card-hdr {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 13px 14px 10px;
	}

	.dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		flex-shrink: 0;
		background: var(--border-hi);
		transition: background 0.2s;
	}

	.card.active .dot {
		background: var(--accent);
		box-shadow: 0 0 0 3px rgba(24, 19, 14, 0.14);
		animation: throb 1.8s ease-in-out infinite;
	}

	@keyframes throb {
		0%, 100% { box-shadow: 0 0 0 3px rgba(24, 19, 14, 0.14); }
		50% { box-shadow: 0 0 0 5px rgba(24, 19, 14, 0.05); }
	}

	.cname {
		font-family: var(--font-serif);
		font-size: 15px;
		font-weight: 600;
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		color: var(--text);
	}

	.card.dead .cname {
		text-decoration: line-through;
		color: var(--text-muted);
	}

	.tbadge {
		font-size: 10px;
		font-weight: 600;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		padding: 3px 8px;
		border-radius: 5px;
		flex-shrink: 0;
	}

	.tbadge.player {
		color: var(--player);
		background: rgba(26, 74, 138, 0.09);
		border: 1px solid rgba(26, 74, 138, 0.22);
	}

	.tbadge.monster {
		color: var(--monster);
		background: rgba(138, 26, 26, 0.09);
		border: 1px solid rgba(138, 26, 26, 0.22);
	}

	.inum {
		font-family: var(--font-mono);
		font-size: 19px;
		font-weight: 500;
		color: var(--text-muted);
		flex-shrink: 0;
		min-width: 26px;
		text-align: right;
		transition: color 0.2s;
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
	}

	.inum:hover {
		color: var(--text);
	}

	.card.active .inum {
		color: var(--text);
	}

	.init-input {
		font-family: var(--font-mono);
		font-size: 19px;
		font-weight: 500;
		color: var(--text);
		background: var(--bg);
		border: 1px solid var(--border-hi);
		border-radius: 6px;
		padding: 2px 5px;
		width: 56px;
		text-align: right;
		outline: none;
		flex-shrink: 0;
	}

	/* HP row */
	.hp-row {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 0 14px 10px;
	}

	.hp-lbl {
		font-size: 10px;
		font-weight: 600;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--text-muted);
		flex-shrink: 0;
		width: 18px;
	}

	.hp-track {
		flex: 1;
		height: 5px;
		background: var(--hp-bar-bg);
		border-radius: 3px;
		overflow: hidden;
	}

	.hp-fill {
		height: 100%;
		border-radius: 3px;
		transition: width 0.3s ease, background 0.3s ease;
	}

	.hp-nums {
		font-family: var(--font-mono);
		font-size: 12px;
		color: var(--text-muted);
		flex-shrink: 0;
		min-width: 56px;
		text-align: right;
	}

	.hp-nums .cur {
		font-size: 16px;
		color: var(--text);
	}

	/* HP controls */
	.hp-ctrl {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 0 14px 12px;
	}

	.mode-btn {
		height: 48px;
		padding: 0 11px;
		flex-shrink: 0;
		border-radius: 12px;
		border: 2px solid var(--border-hi);
		background: var(--bg);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1px;
		transition: all 0.15s;
		min-width: 56px;
	}

	.mode-btn-sign {
		font-family: var(--font-mono);
		font-size: 18px;
		font-weight: 600;
		line-height: 1;
	}

	.mode-btn-label {
		font-family: var(--font-sans);
		font-size: 8px;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		line-height: 1;
		opacity: 0.7;
	}

	.mode-btn.damage {
		color: var(--hp-low);
		border-color: rgba(160, 42, 24, 0.4);
		background: rgba(160, 42, 24, 0.07);
	}

	.mode-btn.heal {
		color: var(--hp-full);
		border-color: rgba(42, 94, 56, 0.4);
		background: rgba(42, 94, 56, 0.07);
	}

	.mode-btn:active {
		transform: scale(0.9);
	}

	.val-btns {
		display: flex;
		gap: 5px;
		flex: 1;
	}

	.vbtn {
		flex: 1;
		height: 48px;
		border-radius: 11px;
		border: 1px solid var(--border);
		background: var(--bg);
		font-family: var(--font-mono);
		font-size: 13px;
		font-weight: 600;
		color: var(--text-mid);
		transition: all 0.12s;
	}

	.vbtn.mode-damage {
		color: var(--hp-low);
		border-color: rgba(160, 42, 24, 0.22);
		background: rgba(160, 42, 24, 0.04);
	}

	.vbtn.mode-heal {
		color: var(--hp-full);
		border-color: rgba(42, 94, 56, 0.22);
		background: rgba(42, 94, 56, 0.04);
	}

	.vbtn:active {
		transform: scale(0.9);
	}

	/* Stats */
	.stats-row {
		display: flex;
		gap: 8px;
		padding: 0 14px 12px;
	}

	.stat-badge {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 64px;
		height: 64px;
		border-radius: 12px;
		border: 1px solid var(--border);
		background: var(--bg);
		gap: 2px;
	}

	.stat-num {
		font-family: var(--font-mono);
		font-size: 26px;
		font-weight: 500;
		color: var(--text);
		line-height: 1;
	}

	.stat-lbl {
		font-size: 10px;
		font-weight: 600;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	/* Conditions */
	.cond-row {
		display: flex;
		flex-wrap: wrap;
		gap: 5px;
		padding: 0 14px 10px;
		align-items: center;
	}

	.ctag {
		display: inline-flex;
		align-items: center;
		gap: 3px;
		font-size: 12px;
		font-weight: 500;
		height: 30px;
		padding: 0 6px 0 10px;
		border-radius: 100px;
		background: rgba(24, 19, 14, 0.06);
		border: 1px solid rgba(24, 19, 14, 0.18);
		color: var(--text-mid);
	}

	.ctag-rm {
		background: none;
		border: none;
		cursor: pointer;
		color: rgba(24, 19, 14, 0.35);
		font-size: 15px;
		line-height: 1;
		padding: 2px 3px;
		display: flex;
		align-items: center;
		transition: color 0.1s;
	}

	.ctag-rm:hover {
		color: var(--text);
	}

	.add-cond-btn {
		font-size: 12px;
		font-weight: 500;
		color: var(--text-muted);
		background: transparent;
		border: 1px dashed var(--border-hi);
		height: 30px;
		padding: 0 12px;
		border-radius: 100px;
		transition: all 0.15s;
	}

	.add-cond-btn:hover {
		color: var(--text);
		border-color: var(--border-hi);
		border-style: solid;
	}

	/* Card actions */
	.card-actions {
		display: flex;
		gap: 8px;
		padding: 0 14px 14px;
		border-top: 1px solid var(--border);
		margin-top: 2px;
		padding-top: 10px;
	}

	.action-btn {
		font-size: 12px;
		font-weight: 500;
		color: var(--text-muted);
		background: transparent;
		border: 1px solid var(--border);
		height: 30px;
		padding: 0 12px;
		border-radius: 8px;
		transition: all 0.15s;
	}

	.action-btn:hover {
		color: var(--text);
		border-color: var(--border-hi);
	}

	.action-btn.danger:hover {
		color: var(--hp-low);
		border-color: rgba(160, 42, 24, 0.4);
		background: rgba(160, 42, 24, 0.05);
	}

	/* Notes */
	.note-row {
		padding: 0 14px 12px;
	}

	.note-field {
		width: 100%;
		font-family: var(--font-sans);
		font-size: 13px;
		color: var(--text-mid);
		background: var(--bg);
		border: 1px solid var(--border);
		border-radius: 9px;
		padding: 8px 11px;
		outline: none;
		overflow: hidden;
		min-height: 38px;
		transition: border-color 0.15s;
		line-height: 1.5;
	}

	.note-field::placeholder {
		color: var(--text-muted);
	}

	.note-field:focus {
		border-color: var(--border-hi);
	}
</style>
