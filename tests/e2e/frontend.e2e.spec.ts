import { test, expect } from '@playwright/test'

test.describe('Frontend', () => {
  test('can go on homepage', async ({ page }) => {
    await page.goto('http://localhost:3000')

    await expect(page).toHaveTitle(/Askold Astakhov/)

    const heading = page.locator('h1').first()

    await expect(heading).toHaveText('Builder and technical partner.')
    await expect(page.getByRole('heading', { name: 'Selected work' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Services' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'From the blog' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Open source' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Contacts' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Selected projects' })).toHaveCount(0)
  })
})
