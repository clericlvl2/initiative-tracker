<script lang="ts">
import type { Combatant } from "@/entities/combatant";
import { encounterStore } from "@/entities/combatant";

interface Props {
	combatant: Combatant;
	onClose: () => void;
	onOpenConditions: () => void;
}

const { combatant, onClose, onOpenConditions }: Props = $props();

type HpMode = "damage" | "heal";
let hpMode = $state<HpMode>("damage");

const HP_VALUES = [1, 2, 3, 5, 10] as const;

function handleHpButton(value: number) {
	if (hpMode === "damage") {
		encounterStore.applyDamage(combatant.id, value);
	} else {
		encounterStore.applyHeal(combatant.id, value);
	}
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
		onClose();
	}
}

function handleDuplicate() {
	encounterStore.duplicateCombatant(combatant.id);
	onClose();
}

function handleRemoveCondition(condition: string) {
	encounterStore.removeCondition(combatant.id, condition);
}

function handleOverlayClick(e: MouseEvent) {
	if (e.target === e.currentTarget) onClose();
}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<div class="overlay" onclick={handleOverlayClick} role="dialog" tabindex="-1" aria-modal="true" aria-label="{combatant.name} controls">
	<div class="drawer">
		<div class="drawer-handle"></div>

		<div class="drawer-header">
			<span class="drawer-name">{combatant.name}</span>
			<span
				class="badge"
				class:badge-pc={combatant.type === "pc"}
				class:badge-monster={combatant.type === "monster"}
			>
				{combatant.type === "pc" ? "PC" : "MON"}
			</span>
		</div>

		<!-- HP controls -->
		<div class="hp-ctrl">
			<button
				class="mode-btn"
				class:mode-damage={hpMode === "damage"}
				class:mode-heal={hpMode === "heal"}
				onclick={() => (hpMode = hpMode === "damage" ? "heal" : "damage")}
				aria-label="Toggle damage/heal mode, currently {hpMode}"
			>
				<span class="mode-sign" aria-hidden="true">{hpMode === "damage" ? "−" : "+"}</span>
				<span class="mode-label" aria-hidden="true">{hpMode === "damage" ? "DMG" : "HEAL"}</span>
			</button>
			<div class="val-btns" role="group" aria-label="{hpMode === 'damage' ? 'Damage' : 'Heal'} amount">
				{#each HP_VALUES as value (value)}
					<button
						class="vbtn"
						class:vbtn-damage={hpMode === "damage"}
						class:vbtn-heal={hpMode === "heal"}
						onclick={() => handleHpButton(value)}
						aria-label="{hpMode === 'damage' ? 'Deal' : 'Heal'} {value} HP"
					>
						{hpMode === "damage" ? `−${value}` : `+${value}`}
					</button>
				{/each}
			</div>
		</div>

		<!-- Conditions -->
		<div class="cond-section">
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
			<button class="add-cond-btn" onclick={onOpenConditions} aria-label="Add or remove conditions">
				+ Condition
			</button>
		</div>

		<!-- Notes -->
		<div class="note-section">
			<textarea
				class="note-field"
				placeholder="Notes…"
				value={combatant.notes}
				oninput={handleNoteInput}
				rows={2}
				maxlength={250}
				aria-label="Notes for {combatant.name}"
			></textarea>
		</div>

		<!-- Actions -->
		<div class="drawer-actions">
			<button class="action-btn" onclick={handleDuplicate} aria-label="Duplicate {combatant.name}">
				Duplicate
			</button>
			<button class="action-btn danger" onclick={handleRemove} aria-label="Remove {combatant.name}">
				Remove
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

	.drawer {
		width: 100%;
		background: var(--surface);
		border-top: 1px solid var(--border);
		border-radius: 22px 22px 0 0;
		padding: 14px 16px 32px;
		display: flex;
		flex-direction: column;
		gap: 14px;
	}

	.drawer-handle {
		width: 38px;
		height: 4px;
		background: var(--border-hi);
		border-radius: 2px;
		align-self: center;
		margin-bottom: 2px;
	}

	.drawer-header {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.drawer-name {
		font-family: var(--font-serif);
		font-size: 18px;
		font-weight: 700;
		color: var(--text);
		flex: 1;
	}

	.badge {
		font-size: 9px;
		font-weight: 700;
		letter-spacing: 0.07em;
		text-transform: uppercase;
		padding: 3px 8px;
		border-radius: 5px;
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

	/* HP controls */
	.hp-ctrl {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.mode-btn {
		height: 52px;
		padding: 0 12px;
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
		min-width: 58px;
		cursor: pointer;
	}

	.mode-sign {
		font-family: var(--font-mono);
		font-size: 20px;
		font-weight: 600;
		line-height: 1;
	}

	.mode-label {
		font-size: 8px;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		line-height: 1;
		opacity: 0.7;
	}

	.mode-btn.mode-damage {
		color: var(--hp-low);
		border-color: rgba(160, 42, 24, 0.4);
		background: rgba(160, 42, 24, 0.07);
	}

	.mode-btn.mode-heal {
		color: var(--hp-full);
		border-color: rgba(42, 94, 56, 0.4);
		background: rgba(42, 94, 56, 0.07);
	}

	.mode-btn:active {
		transform: scale(0.92);
	}

	.val-btns {
		display: flex;
		gap: 5px;
		flex: 1;
	}

	.vbtn {
		flex: 1;
		height: 52px;
		border-radius: 11px;
		border: 1px solid var(--border);
		background: var(--bg);
		font-family: var(--font-mono);
		font-size: 13px;
		font-weight: 600;
		color: var(--text-mid);
		transition: all 0.12s;
		cursor: pointer;
	}

	.vbtn.vbtn-damage {
		color: var(--hp-low);
		border-color: rgba(160, 42, 24, 0.22);
		background: rgba(160, 42, 24, 0.04);
	}

	.vbtn.vbtn-heal {
		color: var(--hp-full);
		border-color: rgba(42, 94, 56, 0.22);
		background: rgba(42, 94, 56, 0.04);
	}

	.vbtn:active {
		transform: scale(0.9);
	}

	/* Conditions */
	.cond-section {
		display: flex;
		flex-wrap: wrap;
		gap: 5px;
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
		cursor: pointer;
	}

	.add-cond-btn:hover {
		color: var(--text);
		border-color: var(--border-hi);
		border-style: solid;
	}

	/* Notes */
	.note-section {
		display: flex;
		flex-direction: column;
	}

	.note-field {
		width: 100%;
		font-family: var(--font-sans);
		font-size: 13px;
		color: var(--text-mid);
		background: var(--bg);
		border: 1px solid var(--border);
		border-radius: 9px;
		padding: 9px 12px;
		outline: none;
		overflow: hidden;
		resize: none;
		min-height: 40px;
		transition: border-color 0.15s;
		line-height: 1.5;
	}

	.note-field::placeholder {
		color: var(--text-muted);
	}

	.note-field:focus {
		border-color: var(--border-hi);
	}

	/* Actions */
	.drawer-actions {
		display: flex;
		gap: 8px;
		padding-top: 2px;
		border-top: 1px solid var(--border);
	}

	.action-btn {
		font-size: 13px;
		font-weight: 500;
		color: var(--text-muted);
		background: transparent;
		border: 1px solid var(--border);
		height: 38px;
		padding: 0 16px;
		border-radius: 9px;
		transition: all 0.15s;
		cursor: pointer;
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
