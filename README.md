# Launch Checklist — Nuvemshop

Aplicativo integrado ao admin da Nuvemshop que permite merchants verificarem se sua loja está pronta para lançamento.

## Pré-requisitos

- **Node.js** >= 18
- **PostgreSQL** >= 14
- **npm** >= 9
- Conta no [Partners Portal da Nuvemshop](https://partners.nuvemshop.com.br/)

## 1. Registrar o App no Partners Portal

1. Acesse [partners.nuvemshop.com.br](https://partners.nuvemshop.com.br/) e crie um novo aplicativo.
2. Configure:
   - **Tipo de app**: Embarcado (embedded)
   - **App URL**: `https://<SEU_DOMINIO>/` (onde o frontend carrega dentro do iframe)
   - **Redirect URL**: `https://<SEU_DOMINIO>/auth/callback`  
     (em desenvolvimento: `http://localhost:3400/auth/callback`)
   - **Webhook URL**: `https://<SEU_DOMINIO>/webhooks`
   - **Eventos de webhook**: `app/installed`, `app/uninstalled`
   - **Permissões (scopes)**: `read_products`, `read_content` (ou conforme necessidade)
3. Anote o **App ID** (CLIENT_ID) e **Client Secret** (CLIENT_SECRET).

## 2. Setup Local

```bash
# Clonar e instalar dependências
git clone <repo-url>
cd launch-checklist
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o .env com seus valores reais
```

### Variáveis de ambiente (.env)

| Variável | Descrição |
|---|---|
| `PORT` | Porta do backend (default: 3400) |
| `NODE_ENV` | `development` ou `production` |
| `CLIENT_ID` | App ID do Partners Portal |
| `CLIENT_SECRET` | Client Secret do Partners Portal |
| `STORE_COUNTRY` | País da loja: `br` ou `ar` (default: `br`) |
| `DATABASE_URL` | Connection string do PostgreSQL |
| `VITE_API_BASE_URL` | URL base do backend para o frontend |
| `VITE_NEXO_CLIENT_ID` | Mesmo valor do CLIENT_ID |

## 3. Banco de Dados

```bash
# Criar o banco PostgreSQL
createdb launch_checklist

# Rodar migrações
npm run db:migrate

# Gerar o Prisma Client
npm run db:generate
```

## 4. Desenvolvimento

```bash
# Iniciar backend + frontend simultaneamente
npm run dev
```

- Backend: `http://localhost:3400`
- Frontend: `http://localhost:8000`

O Vite faz proxy de `/api` para o backend automaticamente.

## 5. Estrutura do Projeto

```
launch-checklist/
├── packages/
│   ├── backend/              # Node.js + Express + Prisma
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   └── src/
│   │       ├── auth/         # OAuth install/callback
│   │       ├── webhooks/     # App lifecycle webhooks
│   │       ├── middleware/   # JWT auth middleware
│   │       ├── checklist/    # Controllers + Services
│   │       ├── checks/       # YAML check registry
│   │       ├── routes.ts
│   │       └── index.ts
│   └── frontend/             # React + Vite + Nimbus
│       └── src/
│           ├── components/   # Nimbus UI components
│           ├── hooks/        # React Query hooks
│           ├── pages/        # ChecklistIndex + ChecklistResults
│           ├── services/     # Axios API client
│           ├── Router/       # React Router + Nexo sync
│           └── i18n/         # pt-BR / es-AR translations
├── .env.example
└── package.json              # Monorepo workspaces
```

## 6. Fluxo de Instalação (Loja de Aplicativos)

```
┌─────────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  Loja de Apps   │    │  Nuvemshop   │    │  Backend     │    │  Admin       │
│  (merchant)     │    │  OAuth       │    │  /auth/      │    │  (iframe)    │
└────────┬────────┘    └──────┬───────┘    └──────┬───────┘    └──────┬───────┘
         │ Instalar           │                    │                   │
         ├───────────────────>│                    │                   │
         │                    │ redirect + code    │                   │
         │                    ├───────────────────>│                   │
         │                    │                    │ troca code por    │
         │                    │<───────────────────┤ access_token      │
         │                    │                    │                   │
         │                    │                    │ salva na tabela   │
         │                    │                    │ stores            │
         │                    │                    │                   │
         │                    │                    │ redirect          │
         │<───────────────────┼────────────────────┤ /apps/{id}        │
         │                    │                    │                   │
         │ Admin carrega app no iframe             │                   │
         ├─────────────────────────────────────────┼──────────────────>│
         │                    │                    │    Nexo connect   │
         │                    │                    │<──────────────────┤
         │                    │                    │    JWT auth       │
         │                    │                    │    API calls      │
         └────────────────────┴────────────────────┴──────────────────┘
```

### Passo a passo:

1. Merchant encontra o app na **Loja de Aplicativos** da Nuvemshop
2. Clica em **"Instalar"** — Nuvemshop exibe a tela de permissões
3. Após autorizar, Nuvemshop redireciona para `/auth/callback?code=<auth_code>`
4. Backend troca o `code` por `access_token` via API da Nuvemshop
5. Credenciais são salvas na tabela `stores` (por `store_id`)
6. Backend redireciona o merchant para `/apps/{CLIENT_ID}` no admin
7. Admin carrega o frontend no iframe — Nexo SDK faz o handshake
8. Frontend obtém JWT via Nexo e usa para autenticar chamadas à API

## 7. Endpoints da API

| Método | Rota | Descrição |
|---|---|---|
| GET | `/auth/install` | Inicia fluxo OAuth |
| GET | `/auth/callback` | Callback do OAuth |
| POST | `/webhooks` | Webhooks da Nuvemshop |
| GET | `/api/registry` | Definições de checks |
| POST | `/api/checklists` | Criar checklist |
| GET | `/api/checklists` | Listar checklists |
| GET | `/api/checklists/:id` | Detalhe de checklist |
| PATCH | `/api/checklists/:id` | Atualizar checklist |
| DELETE | `/api/checklists/:id` | Excluir checklist |
| PATCH | `/api/checklists/:id/checks/:checkId` | Atualizar status de check |
| GET | `/api/checklists/:id/checks/:checkId` | Detalhe de check |
| GET | `/health` | Health check |

## 8. Build para Produção

```bash
npm run build
```

O frontend é buildado com Vite (`packages/frontend/dist/`) e o backend com TypeScript (`packages/backend/dist/`). Em produção, o backend serve os arquivos estáticos do frontend automaticamente.

## 9. Deploy

```bash
# Build completo
npm run build

# Rodar migrações em produção (não-interativo)
npm run db:migrate:deploy

# Iniciar o servidor
NODE_ENV=production npm start
```

### Checklist de deploy:

1. Definir `NODE_ENV=production`
2. Configurar `DATABASE_URL` para o PostgreSQL de produção
3. Configurar `CLIENT_ID`, `CLIENT_SECRET` e `STORE_COUNTRY`
4. Rodar `npm run db:migrate:deploy`
5. Rodar `npm run build` (builda frontend + backend)
6. Iniciar com `npm start` — o backend serve o frontend em `/` e a API em `/api`
7. Atualizar no Partners Portal:
   - **App URL**: `https://<SEU_DOMINIO>/`
   - **Redirect URL**: `https://<SEU_DOMINIO>/auth/callback`
   - **Webhook URL**: `https://<SEU_DOMINIO>/webhooks`

## 10. Publicar na Loja de Aplicativos

1. No [Partners Portal](https://partners.nuvemshop.com.br/), vá até seu app
2. Preencha as informações de listagem:
   - **Nome**: Checklist de Lançamento
   - **Descrição**: Verifique se sua loja está pronta para lançamento
   - **Ícone e screenshots**: Adicione imagens do app
   - **Categoria**: Ferramentas de gestão
3. Certifique-se de que as URLs estão configuradas para o domínio de produção
4. Submeta para **revisão** — a equipe da Nuvemshop avaliará o app
5. Após aprovação, o app ficará disponível na Loja de Aplicativos para todos os merchants
