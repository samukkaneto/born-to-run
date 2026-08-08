# Born to Run — Treinamento e Saúde

Site institucional e aplicativo privado da equipe Born to Run, de Descalvado–SP. A área autenticada funciona como uma comunidade esportiva fechada: feed de treinos, fotos, métricas, curtidas, comentários, comunicados, grupos e prescrição de treinos pelo treinador.

## Leia primeiro

- `README-FABLE5.md` — visão do produto e direção visual para Abacus/Fable.
- `CURRENT_IMPLEMENTATION_STATUS.md` — estado técnico e pendências reais.
- `SUPABASE_OPERATIONS.md` — migrations, recuperação de admin, advisors e smoke test.

Os demais documentos de auditoria/reconstrução são históricos e têm um aviso no topo.

## Stack

- Next.js 16.3.0, React 19.2.4 e TypeScript;
- Tailwind CSS 4 e design system próprio;
- Supabase Auth, PostgreSQL/RLS e Storage privado;
- Vercel como plataforma de deploy;
- Vitest, Playwright, axe e pgTAP para qualidade.

## Desenvolvimento local

Requer Node.js 24 (mesma versão configurada na Vercel).

```bash
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Em outros sistemas, use o comando equivalente para copiar `.env.example` para `.env.local`. Preencha somente:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3000
```

As variáveis `NEXT_PUBLIC_*` chegam ao navegador e nunca podem conter `service_role` ou outro segredo administrativo.

## Banco de dados

Não cole `supabase/schema.sql` sobre um ambiente existente e não edite migrations já aplicadas. Use a CLI e migrations timestampadas:

```bash
npx supabase link --project-ref SEU_PROJECT_ID
npx supabase db push
```

O estado remoto atual termina em `20260808174648_protege_chaves_feed`. Consulte `SUPABASE_OPERATIONS.md` antes de bootstrap, recuperação ou mudança de acesso.

## Gates de qualidade

```bash
npm run lint
npm run typecheck
npm run test:unit
npm run build
npm run test:e2e
```

Com Docker e o Supabase local em execução:

```bash
npx supabase start
npm run test:db
```

`npm run check` executa lint, TypeScript, unitários e build. O banco permanece separado porque depende de Docker.

## Estrutura principal

```text
app/(public)       site institucional
app/(auth)         login, cadastro, recuperação e estados de acesso
app/(dashboard)    área do atleta
app/(admin)        painel de gestão da equipe
components         UI, feed, dashboard e administração
lib/actions        Server Actions validadas
lib/auth           autorização e destinos seguros
lib/supabase       clientes e mídia privada
supabase/migrations migrations imutáveis
supabase/tests     regressão de RLS/Storage com pgTAP
design-refs        seis pranchas visuais para Fable 5
```

## Regras essenciais

- Cadastro novo fica pendente até aprovação.
- Somente membro ativo acessa a comunidade.
- Papel/status não são atualizados diretamente pelo navegador.
- Buckets de avatar e feed são privados e usam URLs assinadas.
- Treinos podem atender à equipe inteira, grupos ou atletas.
- Garmin/Strava são referências de experiência, não integrações desta versão.

Conteúdo oficial: equipe fundada em 2015, aproximadamente 200 atletas, mais de 200 participações, Instagram `@equipeborntorun` e Robson Alves (CREF 119911-G/SP, Treinador Nível 1 World Athletics). Não invente contatos, endereço, resultados ou pessoas.
