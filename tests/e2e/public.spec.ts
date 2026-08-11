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
  const loginLogo = page
    .getByRole('link', { name: /Born to Run — página inicial/i })
    .locator('img')
  await expect(loginLogo).toHaveAttribute('src', /%2Flogo\.png|\/logo\.png/)
  await expect(loginLogo).not.toHaveAttribute('src', /logo-on-light/)
  await expect(page.getByLabel('E-mail')).toBeVisible()
  await expect(page.getByLabel('Senha')).toBeVisible()
  expect(errors).toEqual([])
})

test('visitante é enviado ao login ao abrir a área reservada', async ({ page }) => {
  await page.goto('/dashboard')
  await expect(page).toHaveURL(/\/login(?:\?|$)/)
  await expect(page.getByRole('heading', { name: /Acesse sua conta/i })).toBeVisible()
})

test('PWA publica manifesto, service worker e instalação guiada', async ({ page, request }) => {
  await page.goto('/instalar')
  await expect(page.getByRole('heading', { name: /Leve a Born to Run com você/i })).toBeVisible()

  const manifestResponse = await request.get('/manifest.json')
  expect(manifestResponse.ok()).toBe(true)
  expect(manifestResponse.headers()['content-type']).toContain('application/manifest+json')
  const manifest = await manifestResponse.json()
  expect(manifest).toMatchObject({ id: '/', start_url: '/', scope: '/', display: 'standalone' })
  expect(manifest.icons).toEqual(expect.arrayContaining([
    expect.objectContaining({ sizes: '192x192' }),
    expect.objectContaining({ sizes: '512x512' }),
  ]))

  const workerResponse = await request.get('/sw.js')
  expect(workerResponse.ok()).toBe(true)
  expect(workerResponse.headers()['cache-control']).toContain('no-store')
  expect(await workerResponse.text()).toContain("caches.match('/offline')")

  await page.evaluate(async () => { await navigator.serviceWorker.ready })
  await page.reload()
  await page.context().setOffline(true)
  await page.goto('/dashboard')
  await expect(page.getByRole('heading', { name: /Você está sem conexão/i })).toBeVisible()
  await page.context().setOffline(false)
})

test('cadastro exige ciência dos documentos jurídicos publicados', async ({ page }) => {
  await page.goto('/cadastro')
  await expect(page.getByRole('checkbox')).toHaveAttribute('required', '')
  await expect(page.getByRole('link', { name: 'Termos de Uso' })).toHaveAttribute('href', '/termos')
  await expect(page.getByRole('link', { name: 'Aviso de Privacidade' })).toHaveAttribute('href', '/privacidade')

  await page.goto('/privacidade')
  await expect(page.getByRole('heading', { name: 'Aviso de Privacidade' })).toBeVisible()
  await page.goto('/termos')
  await expect(page.getByRole('heading', { name: 'Termos de Uso' })).toBeVisible()
})

test('formulário de contato envia sem abrir o cliente de e-mail', async ({ page }) => {
  await page.route('**/api/contact', async (route) => {
    expect(route.request().postDataJSON()).toMatchObject({
      name: 'Maria Corredora',
      email: 'maria@example.com',
      message: 'Quero conhecer os treinos da equipe.',
    })
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true}' })
  })

  await page.goto('/contato')
  await page.getByLabel('Nome').fill('Maria Corredora')
  await page.getByLabel('E-mail').fill('maria@example.com')
  await page.getByLabel('Mensagem').fill('Quero conhecer os treinos da equipe.')
  await page.getByRole('button', { name: 'Enviar mensagem' }).click()

  await expect(page.getByRole('heading', { name: 'Mensagem enviada, Maria!' })).toBeVisible()
  await expect(page.getByRole('status')).toContainText('contato@equipeborntorun.com')
})

test('galeria pública e loja reservada respeitam seus públicos', async ({ page }) => {
  await page.goto('/galeria')
  await expect(page.getByRole('heading', { name: /Momentos da equipe/i })).toBeVisible()
  await expect(page.getByText(/selecionada pelo administrador e pelo treinador/i)).toBeVisible()

  await page.goto('/loja')
  await expect(page).toHaveURL(/\/login$/)
  await expect(page.getByRole('heading', { name: /Acesse sua conta/i })).toBeVisible()
  await expect(page.getByText(/Vendas ainda não estão ativas/i)).toHaveCount(0)
})

test('health check informa a revisão sem permitir cache', async ({ request }) => {
  const response = await request.get('/api/health')

  expect(response.ok()).toBe(true)
  expect(response.headers()['cache-control']).toContain('no-store')
  await expect(response.json()).resolves.toMatchObject({
    status: 'ok',
    service: 'born-to-run',
  })
})
