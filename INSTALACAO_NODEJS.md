# 📦 Instalação do Node.js (Necessário para desenvolvimento local)

## Opção 1: Instalação Automática (Recomendado)

1. Acesse: https://nodejs.org/
2. Baixe a versão **LTS** (Long Term Support)
3. Execute o instalador
4. Durante a instalação, certifique-se de marcar a opção **"Add to PATH"**
5. Reinicie o terminal/PowerShell após a instalação

## Opção 2: Via Chocolatey (se tiver instalado)

```powershell
choco install nodejs-lts
```

## Verificar Instalação

Após instalar, abra um novo PowerShell e execute:

```powershell
node --version
npm --version
```

Se mostrar as versões, está tudo certo! ✅

## ⚠️ Importante

**Você NÃO precisa instalar Node.js para fazer deploy no Render!**

O Render faz o build automaticamente. A instalação local é apenas para:
- Desenvolvimento e testes locais
- Ver as mudanças antes de fazer deploy

## Próximos Passos Após Instalar

Depois de instalar o Node.js, eu posso executar:

```powershell
# Instalar dependências
npm install
cd frontend
npm install
cd ../backend
npm install
```

Mas isso pode esperar - vamos focar no deploy primeiro! 🚀


