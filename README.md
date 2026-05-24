# VISA Londrina MVP – Portal de Envio de Documentos

Sistema de automação do licenciamento sanitário da Vigilância Sanitária de Londrina, com validação de documentos por IA.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend + API | Next.js 14 (App Router) + TypeScript |
| ORM / DB | Prisma 5 + PostgreSQL |
| Auth | NextAuth.js (JWT) |
| IA / OCR | Python FastAPI + Tesseract |
| Validação Java | Spring Boot + PDFBox |
| Infra | Docker Compose |

## Pré-requisitos

- Node.js 20+
- Docker & Docker Compose
- Java 17 (para desenvolvimento local do serviço Java)
- Python 3.11+ (para desenvolvimento local do serviço de IA)

## Setup Rápido (Docker)

```bash
# 1. Clone o repositório
git clone https://github.com/gcastrodev/visa-londrina-mvp.git
cd visa-londrina-mvp

# 2. Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com seus valores

# 3. Suba todos os serviços
docker compose up -d

# 4. Execute as migrations
docker compose exec nextjs npx prisma migrate deploy

# 5. (Opcional) Popule o banco com dados iniciais
docker compose exec nextjs npm run db:seed
```

Acesse a URL exibida pelo container (geralmente http://localhost:3000).

## Setup Local (Desenvolvimento)

> **Importante:** o Postgres precisa estar rodando **antes** de `prisma migrate`.  
> O erro `P1001: Can't reach database server` significa que nada está escutando em `localhost:5432`.

### 1. Subir o Postgres (escolha uma opção)

**Opção A — Docker (recomendado):**
```bash
npm run db:postgres
# aguarde ~5s e confira:
docker compose ps
```

**Opção B — Postgres instalado no sistema (CachyOS/Arch):**
```bash
sudo systemctl start postgresql
# crie usuário e banco compatíveis com o .env (visa / visa_secret / visa_londrina)
```

### 2. App Next.js

```bash
cp .env.example .env
npm install --legacy-peer-deps

# Aplica migrations + gera client Prisma
npm run db:migrate

# Dados de teste (usuários e empresa exemplo)
npm run db:seed

npm run dev
```

Use a porta que o terminal mostrar (ex.: `http://localhost:3000` ou `3001` se a 3000 estiver ocupada).

### Credenciais de desenvolvimento (seed)

| Perfil | E-mail | Senha |
|--------|--------|-------|
| Analista | `analista@visa.londrina.pr.gov.br` | `analista123` |
| Requerente | `farmaciavida@exemplo.com` | `requerente123` |
| Admin | `admin@visa.londrina.pr.gov.br` | `admin123` |

### Variável `NEXTAUTH_URL`

Deve usar a **mesma origem** (host + porta) que você abre no navegador. Se o Next subir na porta `3001`, ajuste no `.env`:

```env
NEXTAUTH_URL=http://localhost:3001
```

O logout já evita redirect para porta errada; alinhar o `.env` ainda ajuda em callbacks do NextAuth.

## Testes

```bash
# Testes unitários (regras de checklist e envio)
npm test

# Modo watch durante desenvolvimento
npm run test:watch

# Lint + build
npm run lint
npm run build
```

## Checklist manual do MVP

1. **Login** — entrar como requerente e como analista.
2. **Requerente** — criar processo, enviar documentos (PDF/JPEG/PNG), tentar enviar sem checklist completo (deve bloquear).
3. **Validação IA** — com serviço em `localhost:8000`, documentos passam para `VALIDO`/`INVALIDO`; sem o serviço, ficam `PENDENTE`.
4. **Enviar processo** — só com todos os obrigatórios em status `VALIDO`.
5. **Analista** — ver fila, abrir processo, alterar status (iniciar análise, aprovar, reprovar, solicitar documentos).
6. **Logout** — voltar para `/auth/login` na mesma porta do dev server.

## Estrutura do Projeto

```
visa-londrina-mvp/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API Routes (Node.js)
│   │   │   └── processos/      # CRUD de processos e upload
│   │   ├── auth/login/         # Página de login
│   │   ├── requerente/         # Portal do Requerente
│   │   └── analista/           # Dashboard do Analista
│   ├── components/             # Componentes React reutilizáveis
│   ├── lib/                    # Prisma client, NextAuth, utilitários
│   └── types/                  # TypeScript types centrais
├── prisma/
│   └── schema.prisma           # Schema do banco de dados
├── services/
│   ├── ia/                     # FastAPI (Python) – IA/OCR
│   └── java/                   # Spring Boot – Validação Contrato Social
├── docker-compose.yml
├── Dockerfile
└── .env.example
```

## Fluxo Principal

```
Requerente → Upload PDF → Node.js API → FastAPI (IA)
                                             ↓
                                     Spring Boot (Java)
                                     ContratoSocialService
                                             ↓
                                     ResultadoValidacao JSON
                                             ↓
                               Dashboard Analista (Next.js)
```

## API Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/auth/[...nextauth]` | Login/Logout |
| GET | `/api/processos` | Lista processos (analista) |
| POST | `/api/processos` | Cria processo (requerente) |
| POST | `/api/processos/:id/documentos` | Upload de documento |
| POST | `/api/processos/:id/enviar` | Envia processo (requerente) |
| GET | `/api/processos/:id` | Detalhes do processo |
| PATCH | `/api/processos/:id/status` | Atualiza status (analista) |

## Variáveis de Ambiente

Veja `.env.example` para a lista completa.

## Segurança

- Autenticação JWT via NextAuth.js
- Validação de input com Zod em todas as rotas
- Arquivos limitados a 20MB, apenas PDF/JPEG/PNG
- LGPD: logs de auditoria em cada ação da IA
- `.env` nunca commitado (`.gitignore`)

## Solução de problemas

| Sintoma | Causa provável | Ação |
|---------|----------------|------|
| `P1001` no migrate | Postgres parado | `npm run db:postgres` |
| Erro ao deslogar / redirect estranho | `NEXTAUTH_URL` com porta diferente do `npm run dev` | Ajustar `.env` ou usar a porta do terminal |
| Aviso no `schema.prisma` (url no datasource) | Extensão Prisma 7 no editor; projeto usa Prisma 5 | Ignorar no IDE ou `npx prisma validate` |
| Documento não valida | Serviço IA offline | Subir `services/ia` ou aceitar status `PENDENTE` em dev |
| Botão enviar desabilitado | Checklist incompleto ou doc sem status `VALIDO` | Enviar todos os tipos obrigatórios e aguardar validação |

## Milestones

- [x] Sprint 0 – Setup e Schema
- [x] Sprint 0.5 – Reorganização de pastas + scaffold Next.js
- [x] Sprint 1 – Auth + Login
- [x] Sprint 2 – Portal do Requerente + Upload
- [x] Sprint 3 – Dashboard do Analista + IA
- [x] Sprint 4 – Testes + README
- [ ] MVP Launch
