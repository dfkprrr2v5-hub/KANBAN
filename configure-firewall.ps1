# Script para configurar Windows Firewall para permitir Next.js na porta 3000
# Execute como Administrador

# Verificar se esta executando como Administrador
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host ""
    Write-Host "ERRO: Este script precisa ser executado como Administrador!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Pressione Win+X e selecione 'Windows PowerShell (Admin)' ou 'Terminal (Admin)'" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Pressione qualquer tecla para sair..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

Write-Host ""
Write-Host "Configurando Windows Firewall para porta 3000..." -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

# Verificar perfil ativo
Write-Host "Verificando perfil de rede ativo..." -ForegroundColor Yellow
$currentProfile = (Get-NetFirewallProfile | Where-Object {$_.Enabled -eq $true}).Name
Write-Host "Perfil ativo: $currentProfile" -ForegroundColor White

# Remover regra antiga se existir
Write-Host ""
Write-Host "Removendo regra antiga (se existir)..." -ForegroundColor Yellow
netsh advfirewall firewall delete rule name="Next.js Dev Server - Tactical Ops Kanban" 2>&1 | Out-Null
Write-Host "OK - Regra antiga removida" -ForegroundColor Green

# Criar nova regra para TODOS os perfis
Write-Host ""
Write-Host "Criando regra de firewall para TODOS os perfis (Domain, Private, Public)..." -ForegroundColor Green

$result = netsh advfirewall firewall add rule name="Next.js Dev Server - Tactical Ops Kanban" dir=in action=allow protocol=TCP localport=3000 profile=domain,private,public description="Permite acesso ao servidor Next.js do Tactical Ops Kanban na porta 3000" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "FIREWALL CONFIGURADO COM SUCESSO!" -ForegroundColor Green
    Write-Host "===============================================" -ForegroundColor Green
    Write-Host "Porta 3000 agora esta acessivel em TODOS os perfis de rede." -ForegroundColor Green

    # Verificar a regra criada
    Write-Host ""
    Write-Host "Verificando regra criada..." -ForegroundColor Yellow
    $rule = Get-NetFirewallRule -DisplayName "Next.js Dev Server - Tactical Ops Kanban" -ErrorAction SilentlyContinue
    if ($rule) {
        Write-Host "OK - Regra encontrada" -ForegroundColor Green
        Write-Host "  Nome: $($rule.DisplayName)" -ForegroundColor White
        Write-Host "  Habilitado: $($rule.Enabled)" -ForegroundColor White
        Write-Host "  Acao: $($rule.Action)" -ForegroundColor White
    }

    Write-Host ""
    Write-Host "AGORA TESTE:" -ForegroundColor Cyan
    Write-Host "===============================================" -ForegroundColor Cyan
    Write-Host "1. Abra o navegador" -ForegroundColor White
    Write-Host "2. Acesse: http://192.168.0.22:3000" -ForegroundColor Yellow
    Write-Host "3. Deve funcionar agora!" -ForegroundColor Green

} else {
    Write-Host ""
    Write-Host "ERRO ao configurar firewall!" -ForegroundColor Red
    Write-Host "Detalhes do erro:" -ForegroundColor Red
    Write-Host $result -ForegroundColor Red
}

Write-Host ""
Write-Host "==============================================="
Write-Host "Pressione qualquer tecla para sair..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
