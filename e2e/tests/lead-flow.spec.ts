import { expect, test } from '@playwright/test';

/** B2C lead from a landing → thank-you (CLAUDE.md testing priority, E2E #9). */
test('B2C lead: product page → modal → thank-you', async ({ page }) => {
  await page.goto('/proizvodi/spar-crystal-digital-600hf');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('CRYSTAL DIGITAL');

  await page.getByRole('button', { name: 'Побарај понуда' }).first().click();

  const dialog = page.getByRole('dialog');
  await dialog.getByPlaceholder('Име и презиме').fill('Тест Клиент');
  await dialog.getByPlaceholder(/Телефон/).fill('076676819');
  await dialog.getByRole('checkbox').check();
  await dialog.getByRole('button', { name: /Испрати барање/ }).click();

  await expect(page).toHaveURL(/\/blagodarime/);
  await expect(page.getByRole('heading', { name: /Благодариме/ })).toBeVisible();
});

test('lead form rejects a bad phone', async ({ page }) => {
  await page.goto('/kontakt');
  await page.getByPlaceholder('Име и презиме').fill('Тест');
  await page.getByPlaceholder(/Телефон/).fill('02 3123 456'); // landline
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: /Испрати барање/ }).click();
  await expect(page.getByText('07X XXX XXX')).toBeVisible();
});
