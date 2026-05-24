# VISA Londrina MVP – Portal de Envio de Documentos

Sistema de automação do licenciamento sanitário da Vigilância Sanitária de Londrina, com validação de documentos por IA.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend + API | Next.js 15 (App Router) + TypeScript |
| ORM / DB | Prisma + PostgreSQL |
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
docker-compose up -d

# 4. Execute as migrations
docker-compose exec nextjs npx prisma migrate deploy

# 5. (Opcional) Popule o banco com dados iniciais
docker-compose exec nextjs npm run db:seed
```

Acesse: http://localhost:3000

## Setup Local (Desenvolvimento)

```bash
# Install
npm install

# Banco de dados (precisa do Postgres rodando)
npx prisma migrate dev
npx prisma generate

# Dev server
npm run dev
```

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

## Milestones

- [x] Sprint 0 – Setup e Schema
- [ ] Sprint 1 – Auth + Login
- [ ] Sprint 2 – Portal do Requerente + Upload
- [ ] Sprint 3 – Dashboard do Analista + IA
- [ ] Sprint 4 – Testes + README
- [ ] MVP Launch
