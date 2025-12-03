# 🚀 Guia Rápido de Setup

## Passo a Passo

### 1. Instalar Dependências

```bash
# Instalar dependências do workspace
npm install

# Ou instalar separadamente
cd frontend && npm install
cd ../backend && npm install
```

### 2. Configurar Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta
2. Crie um novo projeto
3. Vá em Settings → API
4. Copie:
   - **Project URL**
   - **anon public** key
   - **service_role** key (mantenha segura!)

### 3. Configurar Variáveis de Ambiente

#### Frontend

Crie o arquivo `frontend/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_aqui
```

#### Backend

Crie o arquivo `backend/.env`:

```env
PORT=3001
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
SUPABASE_ANON_KEY=sua_anon_key_aqui
```

### 4. Executar Localmente

```bash
# Executar frontend e backend juntos
npm run dev

# Ou separadamente:
npm run dev:frontend  # http://localhost:3000
npm run dev:backend   # http://localhost:3001
```

### 5. Deploy no Render

1. **Push para GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <seu-repositorio>
   git push -u origin main
   ```

2. **Configurar no Render:**
   - Acesse [render.com](https://render.com)
   - Conecte seu repositório GitHub
   - Crie dois serviços web (frontend e backend)
   - Configure as variáveis de ambiente
   - Deploy automático!

## ✅ Checklist

- [ ] Node.js 18+ instalado
- [ ] Dependências instaladas
- [ ] Projeto Supabase criado
- [ ] Variáveis de ambiente configuradas
- [ ] Aplicação rodando localmente
- [ ] Repositório no GitHub
- [ ] Serviços configurados no Render

## 🆘 Problemas Comuns

### Erro: "Cannot find module"
```bash
# Reinstale as dependências
rm -rf node_modules package-lock.json
npm install
```

### Erro: "Supabase not configured"
- Verifique se os arquivos `.env` existem
- Confirme que as variáveis estão corretas
- Reinicie o servidor após alterar `.env`

### Porta já em uso
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill
```


