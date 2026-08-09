# Testes e evidências

## Baseline automatizado

- ESLint: aprovado.
- TypeScript: aprovado.
- Vitest: 48/48.
- Build Next.js 16.3.0: aprovado, 27 rotas.
- E2E público: 12/12 em Desktop Chrome e Pixel 7.
- axe: nenhuma violação séria/crítica no baseline.
- pgTAP: 47 asserções no preflight anterior.
- `npm audit`: zero vulnerabilidades conhecidas no baseline.

## CIs verdes do ciclo anterior

- `31275354335`
- `31275507684`
- `31276114847`
- `31276224015`

## Fluxos hospedados já validados

- login e erro de credencial;
- bloqueio de área interna sem sessão;
- publicação, curtida e comentário;
- painel administrativo;
- criação de grupo;
- treino dirigido ao atleta correto;
- limpeza dos dados técnicos ao final.

## Critério para o ciclo atual

Nenhum bloco será declarado concluído somente por compilar. Alterações de Auth/RLS/Storage exigem testes de autorização e Advisors; alterações de UI exigem desktop/mobile e console limpo; publicação exige CI, domínio e logs.
