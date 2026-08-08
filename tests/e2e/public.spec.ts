import { expect, test } from '@playwright/test'

test('site institucional e login carregam sem erros de console', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })

  await page.goto('/')
  await expect(page).toHaveTitle(/Born to Run/i)
  await expect(
    page.getByRole('banner').getByRole('link', { name: /Born to Run — página inicial/i }),
  ).toBeVisible()
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

  await page.goto('/login')
  await expect(page.getByRole('heading', { name: /Acesse sua conta/i })).toBeVisible()
  await expect(page.getByLabel('E-mail')).toBeVisible()
  await expect(page.getByLabel('Senha')).toBeVisible()
  expect(errors).toEqual([])
})

test('visitante é enviado ao login ao abrir a área reservada', async ({ page }) => {
  await page.goto('/dashboard')
  await expect(page).toHaveURL(/\/login(?:\?|$)/)
  await expect(page.getByRole('heading', { name: /Acesse sua conta/i })).toBeVisible()
})
