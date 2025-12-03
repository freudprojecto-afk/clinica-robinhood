# 🚀 Guia Completo de Deploy - Passo a Passo

## ⚠️ IMPORTANTE: Você NÃO precisa instalar Node.js para fazer deploy!

O Render faz tudo automaticamente. Siga estes passos:

---

## 📋 PASSO 1: Criar Conta no Supabase

1. Acesse: https://supabase.com
2. Clique em **"Start your project"** ou **"Sign Up"**
3. Crie uma conta (pode usar GitHub, Google, etc.)
4. Clique em **"New Project"**
5. Preencha:
   - **Name**: `clinica-project` (ou o nome que preferir)
   - **Database Password**: Crie uma senha forte (GUARDE ELA!)
   - **Region**: Escolha a mais próxima (ex: `South America (São Paulo)`)
   - **Pricing Plan**: Free (para começar)
6. Clique em **"Create new project"**
7. Aguarde 2-3 minutos enquanto o projeto é criado

### Obter Credenciais do Supabase:

1. No dashboard do Supabase, vá em **Settings** (⚙️) → **API**
2. Você verá:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public** key: `eyJhbGc...` (chave longa)
   - **service_role** key: `eyJhbGc...` (chave longa - MANTENHA SECRETA!)

**📝 ANOTE ESSAS 3 INFORMAÇÕES - você vai precisar!**

---

## 📋 PASSO 2: Criar Conta no Render

1. Acesse: https://render.com
2. Clique em **"Get Started for Free"**
3. Crie uma conta (pode usar GitHub, Google, etc.)
4. Confirme seu email se necessário

---

## 📋 PASSO 3: Criar Repositório no GitHub

1. Acesse: https://github.com
2. Faça login
3. Clique no **"+"** no canto superior direito → **"New repository"**
4. Preencha:
   - **Repository name**: `clinica-robinhood` (ou o nome que preferir)
   - **Description**: "Aplicação web estilo Robinhood"
   - **Visibility**: Público ou Privado (sua escolha)
   - **NÃO marque** "Add a README file" (já temos um)
5. Clique em **"Create repository"**

### Fazer Upload do Código:

**Opção A - Via GitHub Desktop (Mais Fácil):**
1. Baixe: https://desktop.github.com
2. Instale e faça login
3. Clique em **"File" → "Add Local Repository"**
4. Selecione a pasta: `C:\Users\Lenovo\OneDrive\20251202_projecto clinica`
5. Clique em **"Publish repository"**
6. Escolha o repositório que criou
7. Clique em **"Publish repository"**

**Opção B - Via Git (se tiver instalado):**
Eu posso fazer isso quando você tiver o Git instalado.

---

## 📋 PASSO 4: Configurar Deploy no Render

### 4.1 - Deploy do Backend

1. No Render Dashboard, clique em **"New +"** → **"Web Service"**
2. Conecte seu repositório GitHub:
   - Clique em **"Connect account"** se ainda não conectou
   - Autorize o Render a acessar seus repositórios
   - Selecione o repositório que criou
3. Configure o serviço:
   - **Name**: `clinica-backend`
   - **Region**: Escolha a mais próxima
   - **Branch**: `main` (ou `master`)
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
4. Clique em **"Advanced"** e adicione as variáveis de ambiente:
   - Clique em **"Add Environment Variable"**
   - Adicione uma por uma:
     ```
     PORT = 3001
     SUPABASE_URL = (cole a Project URL do Supabase)
     SUPABASE_SERVICE_ROLE_KEY = (cole a service_role key)
     SUPABASE_ANON_KEY = (cole a anon public key)
     NODE_ENV = production
     ```
5. Clique em **"Create Web Service"**
6. Aguarde o deploy (pode levar 2-5 minutos)
7. Anote a URL do backend (ex: `https://clinica-backend.onrender.com`)

### 4.2 - Deploy do Frontend

1. No Render Dashboard, clique em **"New +"** → **"Web Service"**
2. Selecione o mesmo repositório
3. Configure o serviço:
   - **Name**: `clinica-frontend`
   - **Region**: Mesma do backend
   - **Branch**: `main` (ou `master`)
   - **Root Directory**: `frontend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
4. Clique em **"Advanced"** e adicione as variáveis de ambiente:
   ```
   NEXT_PUBLIC_SUPABASE_URL = (cole a Project URL do Supabase)
   NEXT_PUBLIC_SUPABASE_ANON_KEY = (cole a anon public key)
   NODE_ENV = production
   ```
5. Clique em **"Create Web Service"**
6. Aguarde o deploy (pode levar 3-7 minutos)

---

## ✅ PASSO 5: Verificar se Está Funcionando

1. Acesse a URL do frontend (ex: `https://clinica-frontend.onrender.com`)
2. Você deve ver a interface estilo Robinhood funcionando!
3. Se houver erros, verifique os logs no Render Dashboard

---

## 🔧 Troubleshooting

### Erro: "Build failed"
- Verifique se todas as variáveis de ambiente estão corretas
- Veja os logs no Render para mais detalhes

### Erro: "Cannot connect to Supabase"
- Verifique se as credenciais do Supabase estão corretas
- Confirme que o projeto Supabase está ativo

### Site não carrega
- Aguarde alguns minutos (primeiro deploy pode ser lento)
- Verifique se ambos os serviços (frontend e backend) estão "Live"

---

## 📝 Checklist Final

- [ ] Conta Supabase criada
- [ ] Credenciais do Supabase anotadas
- [ ] Conta Render criada
- [ ] Repositório GitHub criado
- [ ] Código enviado para GitHub
- [ ] Backend deployado no Render
- [ ] Frontend deployado no Render
- [ ] Variáveis de ambiente configuradas
- [ ] Site funcionando!

---

## 🎉 Pronto!

Depois de seguir todos os passos, sua aplicação estará no ar!

**URLs importantes:**
- Frontend: `https://clinica-frontend.onrender.com`
- Backend: `https://clinica-backend.onrender.com`
- Supabase Dashboard: https://supabase.com/dashboard

---

## 💡 Dica

Se precisar fazer mudanças no código:
1. Faça as alterações nos arquivos
2. Faça commit e push para o GitHub
3. O Render detecta automaticamente e faz novo deploy!


