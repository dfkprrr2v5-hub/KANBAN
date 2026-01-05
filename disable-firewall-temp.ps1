# ATENCAO: Este script DESABILITA o firewall temporariamente para testes
# Execute como Administrador
# NAO USE EM PRODUCAO!

$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host ""
    Write-Host "ERRO: Este script precisa ser executado como Administrador!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Pressione qualquer tecla para sair..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Red
Write-Host "  ATENCAO - TESTE DE FIREWALL" -ForegroundColor Red
Write-Host "=========================================" -ForegroundColor Red
Write-Host ""
Write-Host "Este script vai DESABILITAR o Windows Firewall" -ForegroundColor Yellow
Write-Host "APENAS para teste de diagnostico." -ForegroundColor Yellow
Write-Host ""
Write-Host "Voce quer continuar?" -ForegroundColor Yellow
Write-Host ""
Write-Host "[S] Sim   [N] Nao (padrao)" -ForegroundColor White
$confirm = Read-Host "Sua escolha"

if ($confirm -ne "S" -and $confirm -ne "s") {
    Write-Host "Cancelado pelo usuario." -ForegroundColor Gray
    exit 0
}

Write-Host ""
Write-Host "Desabilitando firewall..." -ForegroundColor Yellow
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled False

Write-Host "Firewall DESABILITADO!" -ForegroundColor Red
Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  AGORA TESTE" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

$mainIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like "192.168.*" -or $_.IPAddress -like "10.*"} | Where-Object {$_.InterfaceAlias -notlike "*WSL*" -and $_.InterfaceAlias -notlike "*Hyper-V*"} | Select-Object -First 1).IPAddress

Write-Host "Abra o navegador e teste:" -ForegroundColor White
Write-Host "  http://$mainIP:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Se funcionar agora, o problema e o firewall ou antivirus." -ForegroundColor White
Write-Host "Se NAO funcionar, o problema e outra coisa." -ForegroundColor White
Write-Host ""
Write-Host "=========================================" -ForegroundColor Red
Write-Host "  IMPORTANTE" -ForegroundColor Red
Write-Host "=========================================" -ForegroundColor Red
Write-Host ""
Write-Host "Quando terminar o teste, execute:" -ForegroundColor Yellow
Write-Host "  .\enable-firewall.ps1" -ForegroundColor White
Write-Host ""
Write-Host "Para REABILITAR o firewall!" -ForegroundColor Red
Write-Host ""
Write-Host "Pressione qualquer tecla para sair..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
