# Script para fazer commit e push para GitHub
# Execute este script na pasta raiz do projeto

Write-Host "=== Deploy para GitHub ===" -ForegroundColor Green

# Navegar para a pasta frontend
Set-Location "frontend"

# Verificar se é um repositório git
if (-not (Test-Path ".git")) {
    Write-Host "ERRO: Não é um repositório git. Execute 'git init' primeiro." -ForegroundColor Red
    exit 1
}

# Adicionar todos os ficheiros modificados
Write-Host "`n1. Adicionando ficheiros..." -ForegroundColor Yellow
git add .

# Verificar se há alterações
$status = git status --porcelain
if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Host "Não há alterações para fazer commit." -ForegroundColor Yellow
    exit 0
}

# Fazer commit
Write-Host "`n2. Fazendo commit..." -ForegroundColor Yellow
$commitMessage = "Fix: Corrigir filtro dropdown e estrutura da página com Corpo Clínico"
git commit -m $commitMessage

# Verificar se há remote configurado
$remote = git remote -v
if ([string]::IsNullOrWhiteSpace($remote)) {
    Write-Host "`nAVISO: Não há remote configurado." -ForegroundColor Yellow
    Write-Host "Configure o remote com: git remote add origin <URL_DO_REPOSITORIO>" -ForegroundColor Yellow
    exit 0
}

# Fazer push
Write-Host "`n3. Fazendo push para GitHub..." -ForegroundColor Yellow
git push

Write-Host "`n=== Deploy concluído! ===" -ForegroundColor Green

# Voltar para a pasta raiz
Set-Location ..
