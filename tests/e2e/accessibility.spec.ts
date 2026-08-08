import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

for (const path of ['/', '/login', '/cadastro', '/acesso-pendente']) {
  test(`sem violações sérias ou críticas em ${path}`, async ({ page }) => {
    await page.goto(path)
    const results = await new AxeBuilder({ page }).analyze()
    const important = results.violations.filter((violation) =>
      violation.impact === 'serious' || violation.impact === 'critical',
    )
    const summary = important
      .flatMap((violation) => violation.nodes.map((node) =>
        `${violation.id}: ${node.target.join(' ')} — ${node.failureSummary ?? violation.help}`,
      ))
      .join('\n')
    expect(summary).toBe('')
  })
}
