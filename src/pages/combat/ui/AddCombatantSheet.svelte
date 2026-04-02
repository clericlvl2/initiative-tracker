<script lang="ts">
import type { CombatantType } from "@/entities/combatant";
import { encounterStore } from "@/entities/combatant";

interface Props {
	onClose: () => void;
}

const { onClose }: Props = $props();

let name = $state("");
let combatantType = $state<CombatantType>("monster");
let initMod = $state<number | null>(null);
let maxHp = $state(10);
let ac = $state<number | null>(null);
let pd = $state<number | null>(null);
let md = $state<number | null>(null);

function handleSubmit() {
	if (!name.trim()) return;
	encounterStore.addCombatant({
		name: name.trim(),
		type: combatantType,
		initMod: initMod ?? 0,
		maxHp,
		ac,
		pd: pd ?? 10,
		md: md ?? 10,
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
				class="finput finput-name"
				type="text"
				placeholder="Goblin Chief…"
				bind:value={name}
				autocomplete="off"
			/>
		</div>

		<!-- Type -->
		<div class="form-field">
			<span class="flabel">Type</span>
			<div class="toggle-row">
				<button
					class="toggle-opt"
					class:active-monster={combatantType === "monster"}
					onclick={() => (combatantType = "monster")}
				>Monster</button>
				<button
					class="toggle-opt"
					class:active-pc={combatantType === "pc"}
					onclick={() => (combatantType = "pc")}
				>Player</button>
			</div>
		</div>

		<!-- Initiative Bonus -->
		<div class="form-field">
			<label class="flabel" for="initMod">Initiative Bonus</label>
			<input
				id="initMod"
				class="finput"
				type="number"
				placeholder="+0"
				min="-50"
				max="50"
				bind:value={initMod}
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
					max="1000"
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
					min="0"
					max="50"
					bind:value={ac}
				/>
			</div>
		</div>

		<!-- PD + MD -->
		<div class="form-grid">
			<div class="form-field">
				<label class="flabel" for="pd">Physical Defense</label>
				<input
					id="pd"
					class="finput"
					type="number"
					placeholder="10"
					min="0"
					max="50"
					bind:value={pd}
				/>
			</div>
			<div class="form-field">
				<label class="flabel" for="md">Mental Defense</label>
				<input
					id="md"
					class="finput"
					type="number"
					placeholder="10"
					min="0"
					max="50"
					bind:value={md}
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
		position: absolute;
		inset: 0;
		background: rgba(18, 14, 10, 0.55);
		display: flex;
		align-items: flex-end;
		z-index: 100;
		backdrop-filter: blur(3px);
	}

	.sheet {
		width: 100%;
		background: var(--surface);
		border-top: 1px solid var(--border);
		border-radius: 22px 22px 0 0;
		padding: 16px 20px 36px;
		display: flex;
		flex-direction: column;
		gap: 14px;
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

	.finput-name {
		font-family: var(--font-serif);
		font-size: 18px;
	}

	.finput::placeholder {
		color: var(--text-muted);
	}

	.finput:focus {
		border-color: var(--border-hi);
	}

	.toggle-row {
		display: flex;
		gap: 5px;
	}

	.toggle-opt {
		flex: 1;
		height: 42px;
		border-radius: 10px;
		border: 1px solid var(--border);
		background: var(--card);
		font-size: 13px;
		font-weight: 600;
		color: var(--text-muted);
		transition: all 0.15s;
		cursor: pointer;
	}

	.toggle-opt.active-pc {
		color: var(--player);
		border-color: rgba(26, 74, 138, 0.4);
		background: rgba(26, 74, 138, 0.07);
	}

	.toggle-opt.active-monster {
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
		flex: 1;
		border-radius: 12px;
		transition: color 0.15s;
		cursor: pointer;
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
		cursor: pointer;
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
