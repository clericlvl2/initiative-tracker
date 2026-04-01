<script lang="ts">
	import type { CombatantType } from "@/entities/combatant";
	import { encounterStore } from "@/entities/combatant";

	interface Props {
		onClose: () => void;
	}

	let { onClose }: Props = $props();

	let name = $state("");
	let modifier = $state(0);
	let maxHp = $state(10);
	let ac = $state<number | null>(null);
	let combatantType = $state<CombatantType>("monster");

	function handleSubmit() {
		if (!name.trim()) return;
		encounterStore.addCombatant({
			name: name.trim(),
			modifier,
			type: combatantType,
			maxHp,
			ac,
		});
		onClose();
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
		<h2 class="sheet-title">Add Combatant</h2>

		<!-- Name -->
		<div class="form-field">
			<label class="flabel" for="name">Name</label>
			<input
				id="name"
				class="finput name"
				type="text"
				placeholder="Goblin Chief…"
				bind:value={name}
				autocomplete="off"
			/>
		</div>

		<!-- Type toggle -->
		<div class="form-field">
			<span class="flabel">Type</span>
			<div class="type-row">
				<button
					class="type-opt"
					class:m={combatantType === "monster"}
					onclick={() => (combatantType = "monster")}
				>Monster</button>
				<button
					class="type-opt"
					class:p={combatantType === "pc"}
					onclick={() => (combatantType = "pc")}
				>Player</button>
			</div>
		</div>

		<!-- Initiative -->
		<div class="form-field">
			<label class="flabel" for="modifier">Initiative Bonus</label>
			<input
				id="modifier"
				class="finput"
				type="number"
				placeholder="+0"
				bind:value={modifier}
			/>
		</div>

		<!-- HP + AC -->
		<div class="form-grid">
			<div class="form-field">
				<label class="flabel" for="maxHp">Max HP</label>
				<input
					id="maxHp"
					class="finput"
					type="number"
					min="1"
					bind:value={maxHp}
				/>
			</div>
			<div class="form-field">
				<label class="flabel" for="ac">AC</label>
				<input
					id="ac"
					class="finput"
					type="number"
					placeholder="—"
					bind:value={ac}
				/>
			</div>
		</div>

		<!-- Actions -->
		<div class="sheet-actions">
			<button class="sheet-cancel" onclick={onClose}>Cancel</button>
			<button class="sheet-confirm" onclick={handleSubmit} disabled={!name.trim()}>
				Add to Encounter
			</button>
		</div>
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

	.form-field {
		display: flex;
		flex-direction: column;
		gap: 5px;
	}

	.form-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px;
	}

	.flabel {
		font-size: 11px;
		font-weight: 600;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.finput {
		font-family: var(--font-mono);
		font-size: 16px;
		color: var(--text);
		background: var(--card);
		border: 1px solid var(--border);
		border-radius: 11px;
		padding: 11px 13px;
		outline: none;
		width: 100%;
		transition: border-color 0.15s;
	}

	.finput.name {
		font-family: var(--font-serif);
		font-size: 18px;
	}

	.finput::placeholder {
		color: var(--text-muted);
	}

	.finput:focus {
		border-color: var(--border-hi);
	}

	.type-row {
		display: flex;
		gap: 7px;
	}

	.type-opt {
		flex: 1;
		height: 46px;
		border-radius: 11px;
		border: 1px solid var(--border);
		background: var(--card);
		font-size: 14px;
		font-weight: 600;
		color: var(--text-muted);
		transition: all 0.15s;
	}

	.type-opt.p {
		color: var(--player);
		border-color: rgba(26, 74, 138, 0.4);
		background: rgba(26, 74, 138, 0.07);
	}

	.type-opt.m {
		color: var(--monster);
		border-color: rgba(138, 26, 26, 0.4);
		background: rgba(138, 26, 26, 0.07);
	}

	.sheet-actions {
		display: flex;
		gap: 10px;
	}

	.sheet-cancel {
		font-size: 14px;
		font-weight: 600;
		color: var(--text-muted);
		background: var(--bg);
		border: 1px solid var(--border);
		height: 50px;
		padding: 0 20px;
		border-radius: 12px;
		transition: color 0.15s;
	}

	.sheet-cancel:hover {
		color: var(--text);
	}

	.sheet-confirm {
		font-size: 15px;
		font-weight: 600;
		color: #fff;
		background: var(--text);
		border: none;
		height: 50px;
		border-radius: 12px;
		flex: 1;
		transition: transform 0.1s, background 0.15s;
	}

	.sheet-confirm:hover:not(:disabled) {
		background: #2a241e;
	}

	.sheet-confirm:active:not(:disabled) {
		transform: scale(0.97);
	}

	.sheet-confirm:disabled {
		opacity: 0.4;
	}
</style>
