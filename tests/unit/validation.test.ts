import { describe, expect, it } from 'vitest'
import {
  cleanText,
  isUuid,
  parseOptionalInteger,
  parseOptionalPositiveNumber,
  parsePace,
  uniqueUuids,
  validateEmail,
  validateImageFile,
} from '@/lib/validation'

const UUID_A = '11111111-1111-4111-8111-111111111111'
const UUID_B = '22222222-2222-4222-8222-222222222222'

describe('validação de texto e identidade', () => {
  it('valida UUIDs e rejeita valores manipulados', () => {
    expect(isUuid(UUID_A)).toBe(true)
    expect(isUuid('111')).toBe(false)
    expect(isUuid(null)).toBe(false)
  })

  it('normaliza e limita texto sem aceitar arquivos como texto', () => {
    expect(cleanText('  corrida em equipe  ', 10)).toBe('corrida em')
    expect(cleanText(new File(['x'], 'x.txt'), 20)).toBe('')
  })

  it('normaliza e valida e-mail', () => {
    expect(validateEmail('  ATLETA@EXEMPLO.COM ')).toBe('atleta@exemplo.com')
    expect(validateEmail('email-invalido')).toBeNull()
    expect(validateEmail(`${'a'.repeat(250)}@x.com`)).toBeNull()
  })
})

describe('validação das métricas do treino', () => {
  it('aceita vírgula decimal e respeita limites positivos', () => {
    expect(parseOptionalPositiveNumber('5,25', 10)).toBe(5.25)
    expect(parseOptionalPositiveNumber('', 10)).toBeNull()
    expect(parseOptionalPositiveNumber('0', 10)).toBe('invalid')
    expect(parseOptionalPositiveNumber('-1', 10)).toBe('invalid')
    expect(parseOptionalPositiveNumber('11', 10)).toBe('invalid')
  })

  it('aceita apenas inteiros seguros, positivos e dentro do limite', () => {
    expect(parseOptionalInteger('30', 100)).toBe(30)
    expect(parseOptionalInteger('3.5', 100)).toBe('invalid')
    expect(parseOptionalInteger('0', 100)).toBe('invalid')
    expect(parseOptionalInteger(String(Number.MAX_SAFE_INTEGER + 1), Number.MAX_SAFE_INTEGER)).toBe('invalid')
  })

  it('valida o pace em minutos e segundos', () => {
    expect(parsePace('05:30')).toBe('05:30')
    expect(parsePace('5:30')).toBe('5:30')
    expect(parsePace('5:3')).toBe('invalid')
    expect(parsePace('05:60')).toBe('invalid')
    expect(parsePace('00:00')).toBe('invalid')
    expect(parsePace('')).toBeNull()
  })

  it('deduplica listas de UUID e rejeita a lista inteira se houver um ID inválido', () => {
    expect(uniqueUuids([UUID_A, UUID_A, UUID_B])).toEqual([UUID_A, UUID_B])
    expect(uniqueUuids([UUID_A, 'inválido'])).toBeNull()
  })
})

describe('validação real de imagem', () => {
  it.each([
    ['image/jpeg', [0xff, 0xd8, 0xff, 0x00], 'jpg'],
    ['image/png', [0x89, 0x50, 0x4e, 0x47, 0, 0, 0, 0, 0, 0, 0, 0], 'png'],
    ['image/webp', [0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50], 'webp'],
  ])('aceita assinatura %s', async (type, bytes, extension) => {
    const file = new File([new Uint8Array(bytes)], `foto.${extension}`, { type })
    await expect(validateImageFile(file, 1024)).resolves.toEqual({ extension })
  })

  it('rejeita MIME forjado, formato não permitido, vazio e tamanho excessivo', async () => {
    const forged = new File([new Uint8Array([1, 2, 3, 4])], 'foto.jpg', { type: 'image/jpeg' })
    const gif = new File([new Uint8Array([0x47, 0x49, 0x46])], 'foto.gif', { type: 'image/gif' })
    const empty = new File([], 'foto.png', { type: 'image/png' })
    const large = new File([new Uint8Array([0xff, 0xd8, 0xff, 0x00])], 'foto.jpg', { type: 'image/jpeg' })

    await expect(validateImageFile(forged, 1024)).resolves.toHaveProperty('error')
    await expect(validateImageFile(gif, 1024)).resolves.toHaveProperty('error')
    await expect(validateImageFile(empty, 1024)).resolves.toHaveProperty('error')
    await expect(validateImageFile(large, 3)).resolves.toHaveProperty('error')
  })
})
