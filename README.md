# Clínica - Aplicação Web Estilo Robinhood

Aplicação web moderna com UX/UI inspirada na Robinhood, utilizando Supabase como banco de dados e deploy no Render.

## 🚀 Tecnologias

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express
- **Banco de Dados**: Supabase
- **Deploy**: Render (Frontend + Backend)
- **Versionamento**: GitHub

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Conta no Supabase
- Conta no Render
- Conta no GitHub

## 🛠️ Instalação

### 1. Clone o repositório

```bash
git clone <seu-repositorio>
cd "20251202_projecto clinica"
```

### 2. Instale as dependências

```bash
# Instalar dependências do root (workspace)
npm install

# Ou instalar separadamente
cd frontend && npm install
cd ../backend && npm install
```

### 3. Configure o Supabase

1. Crie um projeto no [Supabase](https://supabase.com)
2. Copie as credenciais do projeto:
   - URL do projeto
   - Anon Key
   - Service Role Key (para o backend)

### 4. Configure as variáveis de ambiente

#### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### Backend (`backend/.env`)

```env
PORT=3001
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🏃 Executar Localmente

### Desenvolvimento (Frontend + Backend)

```bash
npm run dev
```

### Apenas Frontend

```bash
npm run dev:frontend
# ou
cd frontend && npm run dev
```

### Apenas Backend

```bash
npm run dev:backend
# ou
cd backend && npm run dev
```

Acesse:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## 📦 Deploy no Render

### 1. Push para o GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Configurar no Render

#### Frontend Service

1. Acesse [Render Dashboard](https://dashboard.render.com)
2. Clique em "New +" → "Web Service"
3. Conecte seu repositório GitHub
4. Configure:
   - **Name**: `clinica-frontend`
   - **Root Directory**: `frontend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Adicione as variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NODE_ENV=production`

#### Backend Service

1. Clique em "New +" → "Web Service"
2. Conecte o mesmo repositório
3. Configure:
   - **Name**: `clinica-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Adicione as variáveis de ambiente:
   - `PORT=3001`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_ANON_KEY`
   - `NODE_ENV=production`

### 3. Usar render.yaml (Alternativa)

Você pode usar o arquivo `render.yaml` para configurar ambos os serviços de uma vez:

1. No Render Dashboard, vá em "New +" → "Blueprint"
2. Conecte seu repositório
3. Render detectará automaticamente o `render.yaml`

## 🎨 Características da UI

- **Dark Theme**: Design escuro inspirado na Robinhood
- **Animações Suaves**: Transições e animações com Framer Motion
- **Gráficos Interativos**: Visualizações com Recharts
- **Responsivo**: Design mobile-first
- **Componentes Modernos**: Cards, stats, listas estilizadas

## 📁 Estrutura do Projeto

```
.
├── frontend/
│   ├── app/              # Next.js App Router
│   ├── components/       # Componentes React
│   ├── lib/             # Utilitários (Supabase client)
│   └── package.json
├── backend/
│   ├── server.js        # Servidor Express
│   └── package.json
├── render.yaml          # Configuração Render
└── README.md
```

## 🔧 Próximos Passos

1. Configure suas tabelas no Supabase
2. Implemente autenticação (já configurado com Supabase Auth)
3. Crie suas APIs no backend
4. Conecte os componentes do frontend com dados reais
5. Adicione mais funcionalidades conforme necessário

## 📝 Notas

- O frontend usa Next.js 14 com App Router
- O backend é uma API REST simples com Express
- As credenciais do Supabase devem ser mantidas seguras (não commitar `.env`)
- O Render oferece plano gratuito com algumas limitações

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.


