import { expect, test } from '@playwright/test';

/** B2B calculator produces a result and carries into the form. */
test('B2B calculator shows a monthly figure', async ({ page }) => {
  await page.goto('/za-biznis');
  await expect(page.getByRole('heading', { name: /Заборавете на галоните/ })).toBeVisible();
  await expect(page.getByText('Сега плаќате ≈')).toBeVisible();
  await expect(page.getByText('/мес.').first()).toBeVisible();
  await page.getByRole('button', { name: 'Добиј точна понуда' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
});

/** Admin login + CLIENT_VIEWER isolation + template module present. */
test('admin login and template module', async ({ page }) => {
  await page.goto('/admin/login');
  await page.getByPlaceholder('Email').fill('admin@filtervoda.mk');
  await page.getByPlaceholder('Лозинка').fill('admin12345');
  await page.getByRole('button', { name: /Најави се/ }).click();

  await expect(page.getByText('Dashboard')).toBeVisible();
  await page.getByRole('link', { name: 'Дизајн и темплејти' }).click();
  await expect(page.getByText('Б-1 Кристално чисто')).toBeVisible();
  await expect(page.getByText('АКТИВЕН')).toBeVisible();
});

test('CLIENT_VIEWER sees only leads', async ({ page }) => {
  await page.goto('/admin/login');
  await page.getByPlaceholder('Email').fill('client@filtervoda.mk');
  await page.getByPlaceholder('Лозинка').fill('client12345');
  await page.getByRole('button', { name: /Најави се/ }).click();

  await expect(page.getByRole('link', { name: 'Lead-ови' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Производи' })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Корисници' })).toHaveCount(0);
});
