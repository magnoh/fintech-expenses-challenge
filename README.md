# 💳 Fintech Expenses — Gestão Financeira Corporativa

Uma plataforma interna para que colaboradores possam registrar e acompanhar movimentações financeiras de forma simplificada por categorias, contendo um painel analítico (dashboard), filtros e paginação inteligente.

---

## 🚀 Decisões Técnicas & Arquitetura

O projeto foi estruturado seguindo as melhores práticas recomendadas no escopo do desafio para garantir uma entrega profissional, livre de sobre-engenharia (*over-engineering*).

### 🖥️ Backend (NestJS + TypeScript strict)
- **Modularização**: Estruturado estritamente sob os conceitos modulares do NestJS (`AuthModule`, `UsersModule`, `CategoriesModule`, `TransactionsModule`, `DashboardModule`).
- **Persistência & Migrations**: Banco de dados relacional **PostgreSQL** orquestrado via **TypeORM**. Configurado com migrações oficiais obrigatórias para gerenciamento do esquema do banco de dados de maneira profissional.
- **Segurança (JWT)**: Autenticação baseada em JWT com `Passport` e guardas globais (`JwtAuthGuard`) para proteger as rotas de negócio. Adicionalmente, todas as consultas garantem que cada usuário acesse apenas seus próprios dados.
- **Validação de Entrada**: Uso consistente de DTOs mapeados com `class-validator` e `class-transformer` com conversão de tipos implícita ativa.
- **Tratamento de Exceções**: Criação de um filtro global (`HttpExceptionFilter`) para capturar e formatar erros no padrão restrito da API.
- **Semente Automatizada (Seed)**: Implementação de um `DatabaseSeederService` automático executado ao inicializar a aplicação (onApplicationBootstrap), populando o banco com dados iniciais ricos (usuários, categorias e lançamentos) se a base estiver vazia.

### 🎨 Frontend (React 18 + TypeScript)
- **Gerenciamento de Estado**: Utilização da **Context API** para o estado global de autenticação e **React Query (TanStack Query v5)** para cache, sincronização automática e mutações de dados da API.
- **Roteamento**: Configuração de rotas declarativas usando o **React Router v6**, com interceptação de rotas protegidas (`ProtectedRoute`) e redirecionamentos seguros.
- **Formulários**: Implementação de validação de formulários dinâmica no lado do cliente utilizando **React Hook Form** integrado com **Zod**.
- **Design System**: Estilização desenvolvida com **CSS Vanilla (CSS Modules e variáveis globais)** inspirada nos temas Fintech modernos (Dark Mode premium, micro-animações, cards analíticos interativos e feedback visual imediato via Toasts).

---

## 🛠️ Pré-requisitos

Para rodar este projeto localmente, você precisa ter instalado:
1. **Node.js** (v18 ou superior recomendado)
2. **NPM** ou **Yarn**
3. **Docker** e **Docker Compose** (caso prefira rodar o ambiente completo conteinerizado)

---

## 📂 Estrutura de Pastas

```
fintech-expenses-challenge/
├── backend/                  # Código-fonte da API NestJS
│   ├── src/
│   │   ├── auth/             # Módulo de Autenticação (JWT)
│   │   ├── categories/       # Módulo de Categorias (CRUD)
│   │   ├── transactions/     # Módulo de Transações (CRUD + Filtros)
│   │   ├── dashboard/        # Módulo de Estatísticas (Cálculos de Caixa)
│   │   ├── users/            # Módulo de Usuários
│   │   └── migrations/       # Migrações do Banco de Dados
│   └── package.json
│
├── frontend/                 # Código-fonte do Cliente React.js (Vite)
│   ├── src/
│   │   ├── components/       # Componentes globais (Sidebar, Layout...)
│   │   ├── context/          # Contextos globais (Auth, Toast...)
│   │   ├── pages/            # Telas da Aplicação (Dashboard, Login...)
│   │   └── types/            # Typescript Types
│   └── package.json
```

---

## 🔑 Variáveis de Ambiente

### Backend (`/backend/.env`)
Um arquivo `.env.example` foi fornecido no diretório correspondente. Renomeie para `.env` e preencha conforme necessário:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=fintech_expenses
DB_SYNCHRONIZE=true
DB_LOGGING=false
JWT_SECRET=fintech_super_secret_key
JWT_EXPIRES_IN=1d
PORT=3000
```

### Frontend (`/frontend/.env` - Opcional)
Se o backend rodar em uma porta diferente de `3000`, configure no arquivo `.env` do frontend:
```env
VITE_API_URL=http://localhost:3000/api
```

---

## ⚙️ Instalação e Como Rodar

Existem duas formas principais de iniciar a aplicação: utilizando o ambiente local completo com Docker (Recomendado) ou executando os processos manualmente.

### Método 1: Usando Docker Compose (Recomendado)

O Docker Compose orquestra o banco PostgreSQL, pgAdmin, o backend NestJS e o frontend React (rodando sob um servidor Nginx integrado) com apenas um comando.

Na raiz do projeto, execute:
```bash
docker compose up --build
```
Isso iniciará:
- **Frontend**: http://localhost (Porta 80)
- **Backend API**: http://localhost:3000/api
- **pgAdmin**: http://localhost:5050 (E-mail: `admin@admin.com` / Senha: `admin`)

---

### Método 2: Executando Manualmente (Local)

#### 1. Iniciar apenas o Banco de Dados via Docker
```bash
docker compose up db -d
```

#### 2. Configurar e Iniciar o Backend
```bash
cd backend
npm install
npm run start:dev
```
A API iniciará na porta `3000`.

#### 3. Configurar e Iniciar o Frontend
```bash
cd ../frontend
npm install
npm run dev
```
O servidor de desenvolvimento do Vite iniciará em http://localhost:3001.

---

## 🧬 Migrations (Banco de Dados)

Se você estiver rodando a aplicação sem o Docker Compose ou desejar gerar/aplicar migrações manualmente no banco local:

**Executar Migrações Pendentes:**
```bash
cd backend
npm run migration:run
```

**Gerar Nova Migração após alteração em Entidades:**
```bash
npm run migration:generate -- name=NomeDaMigracao
```

---

## 🔗 Link do Deploy

Acesse a aplicação em produção através do link abaixo:
- **URL da Plataforma**: [Insira o link do seu deploy aqui (ex: Render, Vercel, Railway)]

---

## 👥 Usuário Seed para Testes

Ao inicializar, a API detecta se a base está vazia e cria automaticamente o usuário administrador e dados fictícios para facilitar a correção do desafio:

- **E-mail de acesso**: `admin@fintech.com`
- **Senha**: `123456`

Este usuário já conta com:
- Categorias padrão: `Alimentação`, `Transporte`, `Fornecedor`, `Receita de Cliente`.
- Transações pré-lançadas (Receitas e Despesas) em datas distintas para fins de exibição imediata no Dashboard.

---

## 🧪 Executando Testes Automatizados

Foram criados testes unitários cobrindo as camadas críticas de negócio (`AuthService`, `CategoriesService`, `TransactionsService`).

Para rodar os testes:
```bash
cd backend
npm run test
```

