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

## 6. Fluxo de Autenticação

1. Merchant instala o app no admin da Nuvemshop
2. Nuvemshop redireciona para `/auth/install`
3. Backend redireciona para o OAuth da Nuvemshop
4. Após autorização, callback em `/auth/callback` troca o code por access_token
5. Credenciais são salvas na tabela `stores`
6. Frontend usa Nexo SDK para obter JWT e autenticar chamadas à API

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

O backend é compilado com TypeScript e o frontend com Vite.

## 9. Deploy

Para deploy em produção, certifique-se de:

1. Definir `NODE_ENV=production` 
2. Configurar `DATABASE_URL` para o PostgreSQL de produção
3. Rodar `npm run db:migrate` no ambiente de produção
4. Atualizar a **Redirect URL** e **Webhook URL** no Partners Portal para o domínio de produção
5. Servir o frontend buildado como arquivos estáticos ou em um CDN
