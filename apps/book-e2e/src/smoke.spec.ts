import { expect, test } from '@playwright/test';

// Runs against `serve-memory`, so no json-server is needed. Reaching a seeded
// name proves the whole wire: route → shell providers → use case → domain
// rules → store → template. Deliberately the only assertion for now.
test('renders the appointment book', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Appointments');
  await expect(page.getByText('Alice')).toBeVisible();
});
