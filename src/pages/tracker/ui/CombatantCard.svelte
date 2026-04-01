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
	let notesVisible = $state(combatant.notes.length > 0);

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
	let notesBtnLabel = $derived(
		notesVisible ? "Hide note" : combatant.notes ? "Edit note" : "Add note",
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

	function handleRemove() {
		if (confirm(`Remove ${combatant.name}?`)) {
			encounterStore.removeCombatant(combatant.id);
		}
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
	aria-label="{combatant.name}, initiative {combatant.initiative ?? 'unrolled'}, HP {combatant.currentHp}/{combatant.maxHp}"
>
	<!-- Card header (always visible) -->
	<div class="card-hdr">
		<span class="dot" aria-hidden="true"></span>
		<span class="cname">{combatant.name}</span>
		<span
			class="tbadge"
			class:player={combatant.type === "pc"}
			class:monster={combatant.type === "monster"}
			aria-label={combatant.type === "pc" ? "Player character" : "Monster"}
		>
			{combatant.type === "pc" ? "PC" : "Monster"}
		</span>
		<div class="init-wrap">
			<span class="init-lbl" aria-hidden="true">Initiative</span>
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
					onclick={(e) => e.stopPropagation()}
					aria-label="Initiative value"
				/>
			{:else}
				<button
					class="inum"
					onclick={startEditInit}
					aria-label="Edit initiative, currently {combatant.initiative ?? 'unrolled'}"
				>
					{combatant.initiative ?? "—"}
				</button>
			{/if}
		</div>
	</div>

	<!-- HP bar + AC (always visible) -->
	<div class="hp-row" aria-label="HP {combatant.currentHp} of {combatant.maxHp}{combatant.ac !== null ? `, AC ${combatant.ac}` : ''}">
		<span class="hp-lbl" aria-hidden="true">HP</span>
		<div class="hp-track" role="progressbar" aria-valuenow={hpPercent} aria-valuemin={0} aria-valuemax={100}>
			<div class="hp-fill" style="width: {hpPercent}%; background: {hpColor};"></div>
		</div>
		<span class="hp-nums" aria-hidden="true">
			<span class="cur">{combatant.currentHp}</span>/{combatant.maxHp}
		</span>
		{#if combatant.ac !== null}
			<span class="hp-divider" aria-hidden="true"></span>
			<span class="ac-stat" aria-hidden="true">
				<span class="cur ac-num">{combatant.ac}</span>
				<span class="hp-lbl">AC</span>
			</span>
		{/if}
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
				aria-label="Toggle damage/heal mode, currently {hpMode}"
			>
				<span class="mode-btn-sign" aria-hidden="true">{hpMode === "damage" ? "−" : "+"}</span>
				<span class="mode-btn-label" aria-hidden="true">{hpMode === "damage" ? "DMG" : "HEAL"}</span>
			</button>
			<div class="val-btns" role="group" aria-label="{hpMode === 'damage' ? 'Damage' : 'Heal'} amount">
				{#each HP_VALUES as value (value)}
					<button
						class="vbtn"
						class:mode-damage={hpMode === "damage"}
						class:mode-heal={hpMode === "heal"}
						onclick={() => handleHpButton(value)}
						aria-label="{hpMode === 'damage' ? 'Deal' : 'Heal'} {value} HP"
					>
						{hpMode === "damage" ? `−${value}` : `+${value}`}
					</button>
				{/each}
			</div>
		</div>

		<!-- Conditions + Notes toggle -->
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
			<button class="add-cond-btn" onclick={onAddCondition} aria-label="Add condition">
				+ Condition
			</button>
			<button
				class="add-cond-btn"
				class:has-content={combatant.notes.length > 0}
				onclick={(e) => { e.stopPropagation(); notesVisible = !notesVisible; }}
				aria-expanded={notesVisible}
				aria-label="{notesBtnLabel}"
			>
				{notesBtnLabel}
			</button>
		</div>

		<!-- Notes (toggled) -->
		{#if notesVisible}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div class="note-row" onclick={(e) => e.stopPropagation()}>
				<textarea
					class="note-field"
					placeholder="Notes…"
					value={combatant.notes}
					oninput={handleNoteInput}
					rows={2}
					aria-label="Notes for {combatant.name}"
				></textarea>
			</div>
		{/if}

		<!-- Card actions -->
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="card-actions" onclick={(e) => e.stopPropagation()}>
			<button
				class="action-btn"
				onclick={() => encounterStore.duplicateCombatant(combatant.id)}
				aria-label="Duplicate {combatant.name}"
			>
				Duplicate
			</button>
			<button
				class="action-btn danger"
				onclick={handleRemove}
				aria-label="Remove {combatant.name}"
			>
				Remove
			</button>
		</div>
	{/if}
</div>

<style>
	.card {
		background: var(--card);
		border-radius: 12px;
		margin-bottom: 7px;
		overflow: hidden;
		box-shadow: 0 1px 4px rgba(24, 19, 14, 0.07);
		transition: box-shadow 0.15s;
		cursor: pointer;
		user-select: none;
		outline: none;
	}

	.card:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
	}

	.card.active {
		border-left: 3px solid var(--accent);
		box-shadow: 0 2px 10px rgba(24, 19, 14, 0.11);
	}

	.card.dead {
		opacity: 0.38;
	}

	@media (min-width: 640px) {
		.card {
			box-shadow: 0 2px 8px rgba(24, 19, 14, 0.08);
		}
		.card.active {
			box-shadow: 0 2px 10px rgba(24, 19, 14, 0.11);
		}
	}

	/* Card header */
	.card-hdr {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 12px 14px 9px;
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

	.init-wrap {
		display: flex;
		flex-direction: column;
		align-items: center;
		flex-shrink: 0;
		gap: 1px;
	}

	.init-lbl {
		font-size: 8px;
		font-weight: 600;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--text-muted);
		line-height: 1;
	}

	.inum {
		font-family: var(--font-mono);
		font-size: 20px;
		font-weight: 500;
		color: var(--text-muted);
		flex-shrink: 0;
		min-width: 28px;
		text-align: center;
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
		font-size: 20px;
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
		height: 8px;
		background: var(--hp-bar-bg);
		border-radius: 4px;
		overflow: hidden;
	}

	.hp-fill {
		height: 100%;
		border-radius: 4px;
		transition: width 0.3s ease, background 0.3s ease;
	}

	.hp-nums {
		font-family: var(--font-mono);
		font-size: 12px;
		color: var(--text-muted);
		flex-shrink: 0;
		min-width: 58px;
		text-align: right;
	}

	.hp-nums .cur {
		font-size: 20px;
		font-weight: 500;
		color: var(--text);
	}

	.hp-divider {
		width: 1px;
		height: 20px;
		background: var(--border);
		flex-shrink: 0;
		margin: 0 2px;
	}

	.ac-stat {
		display: flex;
		flex-direction: column;
		align-items: center;
		flex-shrink: 0;
		gap: 0;
	}

	.ac-num {
		font-size: 18px;
	}

	/* HP controls */
	.hp-ctrl {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 0 14px 10px;
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

	/* Conditions */
	.cond-row {
		display: flex;
		flex-wrap: wrap;
		gap: 5px;
		padding: 0 14px 8px;
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

	.add-cond-btn.has-content {
		border-style: solid;
		color: var(--text-mid);
	}

	.add-cond-btn:hover {
		color: var(--text);
		border-color: var(--border-hi);
		border-style: solid;
	}

	/* Notes */
	.note-row {
		padding: 0 14px 8px;
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

	/* Card actions */
	.card-actions {
		display: flex;
		gap: 8px;
		padding: 8px 14px 12px;
		border-top: 1px solid var(--border);
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
</style>
