import { describe, expect, it } from 'vitest'
import {
  createContactEmail,
  createContactIdempotencyKey,
  validateContactPayload,
} from '@/lib/contact'

const validContact = {
  name: 'Maria Corredora',
  email: 'maria@example.com',
  message: 'Quero conhecer os treinos da equipe.',
  company: '',
}

describe('formulário de contato', () => {
  it('normaliza um contato válido e identifica o honeypot', () => {
    expect(validateContactPayload({ ...validContact, name: '  Maria   Corredora ' })).toEqual({
      ok: true,
      value: validContact,
      spam: false,
    })

    expect(validateContactPayload({ ...validContact, company: 'Bot Ltda.' })).toMatchObject({
      ok: true,
      spam: true,
    })
  })

  it('rejeita campos ausentes, inválidos ou acima do limite', () => {
    expect(validateContactPayload(null)).toMatchObject({ ok: false })
    expect(validateContactPayload({ name: 'M', email: 'errado', message: 'curta' })).toEqual({
      ok: false,
      errors: {
        name: expect.any(String),
        email: expect.any(String),
        message: expect.any(String),
      },
    })
    expect(validateContactPayload({ ...validContact, message: 'x'.repeat(2_001) })).toMatchObject({
      ok: false,
      errors: { message: expect.any(String) },
    })
  })

  it('cria conteúdo seguro com resposta direcionada ao visitante', () => {
    const email = createContactEmail(
      { ...validContact, name: '<Maria>', message: '<script>alert(1)</script>' },
      'contato@equipeborntorun.com',
    )

    expect(email.reply_to).toBe('maria@example.com')
    expect(email.to).toEqual(['contato@equipeborntorun.com'])
    expect(email.html).toContain('&lt;script&gt;')
    expect(email.html).not.toContain('<script>')
  })

  it('gera uma chave de idempotência estável e específica do conteúdo', async () => {
    const first = await createContactIdempotencyKey(validContact)
    const repeated = await createContactIdempotencyKey(validContact)
    const changed = await createContactIdempotencyKey({ ...validContact, message: 'Outra mensagem.' })

    expect(first).toBe(repeated)
    expect(first).not.toBe(changed)
    expect(first).toMatch(/^contact-form\/[0-9a-f]{64}$/)
  })
})
