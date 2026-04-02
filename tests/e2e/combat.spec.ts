import { expect, test } from "@playwright/test";

test("loads the combat page", async ({ page }) => {
	await page.goto("/");
	await expect(page.getByText("Initiative")).toBeVisible();
	await expect(page.getByText("Round")).toBeVisible();
	await expect(page.getByLabel("Add combatant")).toBeVisible();
});

test("shows empty state with no combatants", async ({ page }) => {
	await page.goto("/");
	await expect(page.getByText("No combatants yet")).toBeVisible();
});

test("can open add combatant sheet", async ({ page }) => {
	await page.goto("/");
	await page.waitForLoadState("networkidle");
	await page.getByLabel("Add combatant").click();
	await expect(page.getByRole("heading", { name: "Add Combatant" })).toBeVisible();
});
