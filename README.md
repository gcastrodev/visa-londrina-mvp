# VISA Londrina MVP – Portal de Envio de Documentos

Sistema de automação do licenciamento sanitário da Vigilância Sanitária de Londrina, com validação de documentos por IA.

---

## Por onde começar?

Você acabou de clonar o repositório e **nada está rodando**? Escolha **um** caminho:

| Caminho | Quando usar | O que sobe |
|---------|-------------|------------|
| **[A – Docker (recomendado)](#caminho-a--docker-tudo-em-containers)** | Quer testar o MVP completo com o mínimo de configuração | Postgres + Portal + IA + Java |
| **[B – Dev local](#caminho-b--dev-local-só-o-app-no-node)** | Vai alterar código no Next.js dia a dia | Só Postgres no Docker + `npm run dev` na máquina |

> **Não misture os dois ao mesmo tempo** na mesma porta. Docker usa **3002**; `npm run dev` usa **3000** (ou 3001).

---

## Pré-requisitos

### Caminho A (Docker)

- [Docker](https://docs.docker.com/get-docker/) e Docker Compose (Docker Desktop no Windows/Mac)
- Git

### Caminho B (Dev local)

- Node.js **20+**
- Docker **só para o Postgres** (ou Postgres instalado no sistema)
- Git

Opcional (não precisa para o fluxo básico):

- Python 3.11+ — serviço de IA local (`services/ia`)
- Java 17 — serviço Java local (`services/java`)

---

## Caminho A – Docker (tudo em containers)

Use quando o computador está “zerado”: sem banco, sem app, Docker parado.

### 1. Clone e entre na pasta

```bash
git clone https://github.com/gcastrodev/visa-londrina-mvp.git
cd visa-londrina-mvp
```

### 2. Variáveis de ambiente

```bash
cp .env.example .env
```

Edite o `.env` e defina pelo menos:

```env
NEXTAUTH_SECRET=cole_aqui_um_segredo_aleatorio
```

Gere um segredo, se quiser:

```bash
openssl rand -base64 32
```

Para **Docker**, deixe (ou use) estas linhas — o portal fica na porta **3002**:

```env
DATABASE_URL="postgresql://visa:visa_secret@localhost:5432/visa_londrina"
NEXTAUTH_URL=http://localhost:3002
```

(`DATABASE_URL` com `localhost` é usada pelo seed rodando na sua máquina; dentro dos containers o compose usa o host `postgres`.)

### 3. Suba tudo

Certifique-se de que o **Docker Desktop/daemon está ligado**, depois:

```bash
npm run docker:up
```

Na primeira vez isso **constrói as imagens** (pode levar alguns minutos). Depois:

- `migrate` aplica as tabelas no banco
- `nextjs`, `ia_service` e `java_service` sobem

Confira:

```bash
docker compose ps
```

Todos devem estar `Up` (o `migrate` aparece como `Exited` — é normal).

### 4. Dados de teste (usuários para login)

Com o Postgres exposto na porta **5432**:

```bash
npm run docker:seed
```

### 5. Abra no navegador

| O quê | URL |
|-------|-----|
| **Portal** | http://localhost:3002 |
| Health check | http://localhost:3002/api/health |
| IA (opcional) | http://localhost:8000/health |

### 6. Login

| Perfil | E-mail | Senha |
|--------|--------|-------|
| Analista | `analista@visa.londrina.pr.gov.br` | `analista123` |
| Requerente | `farmaciavida@exemplo.com` | `requerente123` |
| Admin | `admin@visa.londrina.pr.gov.br` | `admin123` |

### Parar tudo

```bash
npm run docker:down
```

---

## Caminho B – Dev local (só o app no Node)

Use para desenvolver o frontend/API sem rebuild de Docker a cada mudança.

### 1. Clone, `.env` e dependências

```bash
git clone https://github.com/gcastrodev/visa-londrina-mvp.git
cd visa-londrina-mvp
cp .env.example .env
npm install --legacy-peer-deps
```

No `.env`, para dev local:

```env
NEXTAUTH_SECRET=um_segredo_qualquer_em_dev
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL="postgresql://visa:visa_secret@localhost:5432/visa_londrina"
```

### 2. Suba **só** o Postgres

Docker ligado, então:

```bash
npm run db:postgres
```

Espere ~5 s e confira:

```bash
docker compose ps
```

Deve aparecer `visa_postgres` como `healthy`.

> Erro `P1001: Can't reach database server` = Postgres ainda não está rodando nesta etapa.

### 3. Banco: migrations + seed

```bash
npm run db:migrate
npm run db:seed
```

### 4. Rode o app

**Opção simples (sem IA/Java)** — documentos viram `VALIDO` automaticamente:

```bash
npm run dev:mock
```

**Opção normal:**

```bash
npm run dev
```

Use a URL que o terminal mostrar (ex.: http://localhost:3000 ou **3001** se a 3000 estiver ocupada).

Se a porta for 3001, ajuste no `.env`:

```env
NEXTAUTH_URL=http://localhost:3001
```

### 5. Login

Mesmas credenciais da [tabela acima](#6-login).

### Parar

- App: `Ctrl+C` no terminal do `npm run dev`
- Postgres: `docker compose stop postgres` ou `npm run docker:down` (para todos os containers)

---

## Como saber se está funcionando?

```bash
# Dev local (porta 3000 ou a que o terminal mostrou)
curl http://localhost:3000/api/health

# Docker (porta 3002)
curl http://localhost:3002/api/health
```

Resposta esperada:

```json
{"status":"ok","database":"connected",...}
```

---

## Comandos úteis

| Comando | Descrição |
|---------|-----------|
| `npm run docker:up` | Sobe stack Docker (build + migrate + serviços) |
| `npm run docker:down` | Para e remove containers da stack |
| `npm run docker:seed` | Popula usuários de teste (Postgres em `localhost:5432`) |
| `npm run db:postgres` | Só Postgres (dev local) |
| `npm run db:migrate` | Migrations (dev local) |
| `npm run db:seed` | Seed (dev local ou após Docker) |
| `npm run dev` | Next.js em desenvolvimento |
| `npm run dev:mock` | Dev com validação de documentos simulada |
| `npm test` | Testes unitários |
| `npm run build` | Build de produção |

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend + API | Next.js 14 (App Router) + TypeScript |
| ORM / DB | Prisma 5 + PostgreSQL |
| Auth | NextAuth.js (JWT) |
| IA / OCR | Python FastAPI + Tesseract |
| Validação Java | Spring Boot + PDFBox |
| Infra | Docker Compose |

## Estrutura do Projeto

```
visa-londrina-mvp/
├── src/                 # Next.js (app, components, lib, types)
├── prisma/              # schema + migrations + seed
├── services/
│   ├── ia/              # FastAPI
│   └── java/            # Spring Boot
├── docker-compose.yml
└── Dockerfile
```

## API Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/health` | Saúde da API e do banco |
| POST | `/api/auth/[...nextauth]` | Login / logout |
| GET | `/api/processos` | Lista processos (analista) |
| POST | `/api/processos` | Cria processo (requerente) |
| POST | `/api/processos/:id/documentos` | Upload |
| POST | `/api/processos/:id/enviar` | Envia processo |
| GET | `/api/processos/:id` | Detalhes |
| PATCH | `/api/processos/:id/status` | Atualiza status (analista) |

## Testes

```bash
npm test
npm run lint
npm run build
```

## Solução de problemas

| Sintoma | O que fazer |
|---------|-------------|
| `P1001` / can't reach database | Suba o Postgres: `npm run db:postgres` (dev) ou `npm run docker:up` (Docker) |
| `port 3000: address already in use` no Docker | Normal se `npm run dev` está rodando — use http://localhost:**3002** (Docker) |
| Portal Docker não abre | `docker compose ps` — `visa_nextjs` deve estar `Up`; veja `docker logs visa_nextjs` |
| `migrate` falhou | `docker logs visa_migrate`; confira Docker ligado e porta 5432 livre |
| Login não mantém sessão | `NEXTAUTH_URL` deve bater com a porta do navegador (3000/3001 dev, **3002** Docker) |
| Documento fica `PENDENTE` | IA offline — use `npm run dev:mock` ou stack Docker completa |
| Botão **Enviar** desabilitado | Falta documento obrigatório ou status não é `VALIDO` |
| Aviso no `schema.prisma` no editor | Extensão Prisma 7 vs projeto Prisma 5 — pode ignorar; `npx prisma validate` passa |

## Variáveis de ambiente

Lista completa em `.env.example`.

## Segurança (produção)

- `NEXTAUTH_SECRET` forte e único
- `IA_MOCK=false`
- `NEXTAUTH_URL` com HTTPS e domínio real
- Nunca commitar `.env`

## Milestones

- [x] Sprint 0 – Setup e Schema
- [x] Sprint 0.5 – Scaffold Next.js
- [x] Sprint 1 – Auth + Login
- [x] Sprint 2 – Portal do Requerente
- [x] Sprint 3 – Dashboard do Analista
- [x] Sprint 4 – Testes + README
- [x] MVP Launch – Docker, health, IA mock
