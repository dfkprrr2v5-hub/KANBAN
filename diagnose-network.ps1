# Script de Diagnostico de Rede
# Execute como Administrador

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  DIAGNOSTICO DE REDE - Tactical Ops" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar se Next.js esta rodando
Write-Host "1. Verificando se Next.js esta rodando..." -ForegroundColor Yellow
$port3000 = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
if ($port3000) {
    Write-Host "   OK - Next.js rodando na porta 3000" -ForegroundColor Green
    Write-Host "   PID: $($port3000.OwningProcess)" -ForegroundColor White
} else {
    Write-Host "   ERRO - Next.js NAO esta rodando!" -ForegroundColor Red
    Write-Host "   Execute: npm run dev" -ForegroundColor Yellow
}

# 2. Verificar IPs da maquina
Write-Host ""
Write-Host "2. IPs disponiveis nesta maquina:" -ForegroundColor Yellow
$ips = Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.*"}
foreach ($ip in $ips) {
    Write-Host "   - $($ip.IPAddress) ($($ip.InterfaceAlias))" -ForegroundColor White
}

# 3. Verificar regra de firewall
Write-Host ""
Write-Host "3. Verificando regra de firewall..." -ForegroundColor Yellow
$rule = Get-NetFirewallRule -DisplayName "Next.js Dev Server - Tactical Ops Kanban" -ErrorAction SilentlyContinue
if ($rule) {
    Write-Host "   OK - Regra existe" -ForegroundColor Green
    Write-Host "   Habilitada: $($rule.Enabled)" -ForegroundColor White
    Write-Host "   Perfis: $($rule.Profile)" -ForegroundColor White
    Write-Host "   Acao: $($rule.Action)" -ForegroundColor White
} else {
    Write-Host "   ERRO - Regra NAO encontrada!" -ForegroundColor Red
    Write-Host "   Execute: .\configure-firewall.ps1" -ForegroundColor Yellow
}

# 4. Verificar perfil de rede ativo
Write-Host ""
Write-Host "4. Perfis de rede ativos:" -ForegroundColor Yellow
$profiles = Get-NetFirewallProfile | Where-Object {$_.Enabled -eq $true}
foreach ($profile in $profiles) {
    Write-Host "   - $($profile.Name)" -ForegroundColor White
}

# 5. Verificar antivirus/seguranca
Write-Host ""
Write-Host "5. Software de seguranca detectado:" -ForegroundColor Yellow
try {
    $av = Get-CimInstance -Namespace root/SecurityCenter2 -ClassName AntiVirusProduct -ErrorAction SilentlyContinue
    if ($av) {
        foreach ($a in $av) {
            Write-Host "   - $($a.displayName)" -ForegroundColor White
        }
    } else {
        Write-Host "   - Nenhum antivirus detectado" -ForegroundColor White
    }
} catch {
    Write-Host "   - Nao foi possivel verificar" -ForegroundColor Gray
}

# 6. Testar conexao local
Write-Host ""
Write-Host "6. Testando conexao local..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/kanban/board" -TimeoutSec 3 -ErrorAction Stop
    Write-Host "   OK - localhost:3000 funciona!" -ForegroundColor Green
} catch {
    Write-Host "   ERRO - localhost:3000 NAO funciona!" -ForegroundColor Red
}

# 7. Testar conexao via IP de rede
Write-Host ""
Write-Host "7. Testando conexao via IP de rede..." -ForegroundColor Yellow
$mainIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like "192.168.*" -or $_.IPAddress -like "10.*"} | Where-Object {$_.InterfaceAlias -notlike "*WSL*" -and $_.InterfaceAlias -notlike "*Hyper-V*"} | Select-Object -First 1).IPAddress

if ($mainIP) {
    Write-Host "   Testando: http://$mainIP:3000" -ForegroundColor White
    try {
        $response = Invoke-WebRequest -Uri "http://$mainIP:3000/api/kanban/board" -TimeoutSec 5 -ErrorAction Stop
        Write-Host "   OK - $mainIP:3000 funciona!" -ForegroundColor Green
    } catch {
        Write-Host "   ERRO - $mainIP:3000 NAO funciona!" -ForegroundColor Red
        Write-Host "   Mensagem: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 8. Recomendacoes
Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  RECOMENDACOES" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

if ($av) {
    Write-Host "IMPORTANTE: Voce tem antivirus instalado!" -ForegroundColor Yellow
    Write-Host "O antivirus pode ter seu proprio firewall bloqueando a porta 3000." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Verifique as configuracoes do antivirus e permita a porta 3000." -ForegroundColor White
    Write-Host ""
}

Write-Host "URLs para testar no navegador:" -ForegroundColor Cyan
Write-Host "  - http://localhost:3000" -ForegroundColor White
if ($mainIP) {
    Write-Host "  - http://$mainIP:3000" -ForegroundColor White
}

Write-Host ""
Write-Host "Pressione qualquer tecla para sair..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
