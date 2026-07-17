# Born to Run — Treinamento e Saúde 🏃

Plataforma web completa para a equipe de corrida e caminhada **Born to Run**, de Descalvado-SP, fundada em 2015 pelo Prof. Robson Alves (CREF 119911-G/SP).

## Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Front-end | Next.js 16 (App Router) + React + TypeScript |
| Estilização | Tailwind CSS + CSS customizado |
| Banco de Dados | Supabase (PostgreSQL + RLS) |
| Autenticação | Supabase Auth |
| Storage | Supabase Storage |
| Deploy | Vercel |

---

## Pré-requisitos

- Node.js 18+
- Conta no [Supabase](https://supabase.com)
- Conta na [Vercel](https://vercel.com)

---

## Configuração Local

### 1. Clonar e instalar
```bash
git clone <seu-repo>
cd born-to-run
npm install
```

### 2. Variáveis de ambiente
Crie (ou edite) o arquivo `.env.local` na raiz:
```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_publica
```

### 3. Banco de dados (Supabase)
Execute o arquivo `supabase/schema.sql` no **SQL Editor** do Supabase:
- Acesse: `https://supabase.com/dashboard/project/SEU_ID/sql/new`
- Cole o conteúdo do arquivo e clique em **Run**

### 4. Tornar Robson administrador
Após o primeiro login com o e-mail do Robson, execute no SQL Editor:
```sql
UPDATE public.profiles
SET role = 'admin'
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'email-do-robson@exemplo.com'
);
```

### 5. Imagens (necessárias na pasta `/public`)
| Arquivo | Descrição |
|---|---|
| `logo.png` | Logo da Born to Run (PNG transparente) |
| `robson-portrait.jpg` | Foto do Robson em campo |
| `robson-running.jpg` | Foto do Robson correndo |
| `team-group.jpg` | Foto do grupo com banner |

### 6. Rodar localmente
```bash
npm run dev
```
Acesse: [http://localhost:3000](http://localhost:3000)

---

## Deploy na Vercel

### Método 1 — Interface (recomendado)
1. Acesse [vercel.com](https://vercel.com) e clique em **Add New Project**
2. Conecte seu repositório GitHub
3. Em **Environment Variables**, adicione:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Clique em **Deploy**

### Método 2 — CLI
```bash
npm i -g vercel
vercel --prod
```

---

## Estrutura do Projeto

```
born-to-run/
├── app/
│   ├── (public)/        → Páginas públicas (/, /sobre, /galeria, /equipe, /resultados, /contato)
│   ├── (auth)/          → Login, Cadastro, Recuperar Senha
│   ├── (dashboard)/     → Área de membros (Feed, Treinos, Perfil)
│   └── (admin)/         → Painel administrativo (Robson)
├── components/
│   ├── layout/          → Header, Footer
│   ├── feed/            → PostCard, NewPostForm, PerfilForm
│   └── admin/           → AdminForm
├── lib/
│   ├── supabase/        → client.ts, server.ts, middleware.ts
│   ├── actions/         → auth.ts, feed.ts, admin.ts
│   └── utils.ts
├── supabase/
│   └── schema.sql       → Script SQL completo com RLS
└── types/
    └── index.ts         → Tipos TypeScript globais
```

---

## Funcionalidades

### Área Pública
- 🏠 Home com hero, estatísticas e CTAs
- 📖 Sobre — história da equipe desde 2015
- 🖼️ Galeria com filtros por categoria
- 📊 Resultados — evolução dos atletas
- 👤 Equipe — perfil do Prof. Robson Alves
- 📱 Contato — WhatsApp, Instagram, CREF

### Área de Membros (`/dashboard`)
- 📋 Dashboard com treinos e comunicados
- 📰 Feed social (post, curtir, comentar)
- 💪 Listagem de treinos por nível
- 👤 Edição de perfil com foto

### Painel Admin (`/admin`)
- 📊 Visão geral com contagens
- ➕ CRUD de treinos
- 📢 CRUD de comunicados
- 👥 Gerenciamento de membros + promoção/remoção de admin

---

## Segurança (RLS)

Todas as tabelas possuem **Row Level Security** configurada:
- Membros só veem dados autenticados
- Membros só editam/deletam o próprio conteúdo
- Somente admins criam treinos e comunicados
- Somente admins podem gerenciar membros

---

## Contato

**Prof. Robson Alves** — CREF 119911-G/SP  
📍 Descalvado-SP  
📸 [@equipeborntorun](https://instagram.com/equipeborntorun)
