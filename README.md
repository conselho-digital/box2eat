# Box2eat

Marketplace de delivery (estilo Uber Eats/iFood) para o Brasil. Next.js (App
Router) + Supabase (Postgres, Auth, Storage, Realtime).

O plano técnico completo (modelagem de dados, RLS, roadmap por fases) está
descrito na sessão de planejamento; a Fase 1 (auth + perfis + empresas) já
está implementada.

## Setup

```bash
npm install
cp .env.example .env.local  # preencha com a URL e a publishable key do projeto Supabase
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Autenticação

Login/cadastro suporta e-mail+senha, Google e Apple (Supabase Auth). Os
provedores OAuth precisam ser configurados no painel do Supabase
(Authentication → Providers) com as credenciais de cada plataforma antes de
funcionarem em produção.

## Estrutura

- `app/` — rotas (App Router)
- `components/` — componentes React (`ui/` é shadcn/ui)
- `lib/supabase/` — clients Supabase (browser, server, middleware) e tipos do banco
- `lib/domain/` — regras de negócio (chamadas Supabase), desacopladas do Next.js
- `lib/validations/` — schemas Zod dos formulários

## Banco de dados

O schema (Fase 1: `profiles`, `user_addresses`, `companies`,
`company_members`, `platform_admins`) foi aplicado via migrations do MCP do
Supabase diretamente no projeto `box2eat`. O limite de empresas por usuário
(2 criadas / 5 conectadas) é garantido por um trigger no banco, testado via
SQL simulando usuários concorrentes.
