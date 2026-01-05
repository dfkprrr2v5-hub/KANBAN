# Configuração do Windows Firewall para Acesso na Rede

## 🔥 Problema Detectado

O Next.js está rodando, mas o **Windows Firewall está bloqueando** o acesso pela rede.

**Sintomas:**
- ✅ `http://localhost:3000` funciona
- ❌ `http://192.168.0.22:3000` não funciona (ERR_CONNECTION_TIMED_OUT)

**Causa:** Windows Firewall bloqueando conexões de entrada na porta 3000.

---

## Solução Rápida (Recomendado)

### Método 1: Script Automático PowerShell

1. **Abra PowerShell como Administrador:**
   - Pressione `Win+X`
   - Clique em **"Windows PowerShell (Admin)"** ou **"Terminal (Admin)"**

2. **Navegue até a pasta do projeto:**
   ```powershell
   cd "C:\Users\mathe\OneDrive\Desktop\App\tactical-ops-kanban"
   ```

3. **Execute o script:**
   ```powershell
   .\configure-firewall.ps1
   ```

4. **Se aparecer erro de política de execução:**
   ```powershell
   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
   .\configure-firewall.ps1
   ```

5. **Resultado:**
   ```
   ✅ Firewall configurado com sucesso!
   Porta 3000 agora está acessível na rede.

   Teste no navegador: http://192.168.0.22:3000
   ```

---

## Solução Manual (Interface Gráfica)

### Passo 1: Abrir o Windows Firewall

1. Pressione `Win+R`
2. Digite: `wf.msc`
3. Pressione Enter

### Passo 2: Criar Regra de Entrada

1. No painel esquerdo, clique em **"Regras de Entrada"** (Inbound Rules)

2. No painel direito, clique em **"Nova Regra..."** (New Rule)

### Passo 3: Configurar a Regra

**Tipo de Regra:**
- Selecione: **"Porta"** (Port)
- Clique em **"Avançar"** (Next)

**Protocolo e Portas:**
- Protocolo: **TCP**
- Porta local específica: **3000**
- Clique em **"Avançar"**

**Ação:**
- Selecione: **"Permitir a conexão"** (Allow the connection)
- Clique em **"Avançar"**

**Perfil:**
- Marque **TODOS** os perfis:
  - ✅ Domínio
  - ✅ Particular (Privado)
  - ✅ Público
- Clique em **"Avançar"**

**Nome:**
- Nome: **Next.js Dev Server - Tactical Ops Kanban**
- Descrição: **Permite acesso ao servidor Next.js na porta 3000**
- Clique em **"Concluir"**

### Passo 4: Verificar

1. Em **"Regras de Entrada"**, procure:
   - **Next.js Dev Server - Tactical Ops Kanban**
   - Status: **Habilitado** (Enabled)
   - Ação: **Permitir** (Allow)
   - Porta: **3000**

---

## Verificação

### Teste 1: No Seu PC (Host)

Abra o navegador e teste:

1. **Localhost:**
   ```
   http://localhost:3000
   ```
   ✅ Deve funcionar

2. **IP da rede:**
   ```
   http://192.168.0.22:3000
   ```
   ✅ Agora deve funcionar também!

### Teste 2: De Outro PC na Rede

No outro PC, abra o navegador:
```
http://192.168.0.22:3000
```
✅ Deve mostrar o Kanban board!

### Teste 3: API Endpoint

Teste o endpoint da API:
```
http://192.168.0.22:3000/api/kanban/board
```
✅ Deve mostrar JSON com os dados

---

## Troubleshooting

### "Acesso negado" ao executar o script

**Problema:** PowerShell requer permissões de administrador.

**Solução:**
1. Feche o PowerShell
2. Abra novamente **como Administrador** (Win+X → PowerShell Admin)
3. Execute novamente

### Script não executa - política de execução

**Problema:** Windows bloqueia scripts não assinados.

**Solução:**
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\configure-firewall.ps1
```

Ou use o método manual pela interface gráfica.

### Ainda não funciona após configurar

**Verifique:**

1. **Next.js está rodando?**
   ```bash
   npm run dev
   ```
   Deve mostrar: `- Local: http://localhost:3000`

2. **Firewall corporativo ou antivírus?**
   - Se estiver em rede corporativa, pode haver firewall adicional
   - Antivírus pode ter firewall próprio (Avast, Norton, etc.)
   - Verifique as configurações deles

3. **IP correto?**
   ```bash
   ipconfig
   ```
   Procure por "IPv4 Address" na sua conexão ativa (Wi-Fi ou Ethernet)
   Use esse IP!

### Firewall corporativo bloqueando

**Se estiver em rede corporativa:**
- Pode haver políticas de grupo que bloqueiam
- Fale com o administrador de TI
- Use apenas `localhost` no mesmo PC

---

## Segurança

### ⚠️ Considerações Importantes

1. **Apenas para Desenvolvimento:**
   - Esta configuração é para ambiente de desenvolvimento
   - Não exponha para a internet pública

2. **Rede Local Confiável:**
   - Use apenas em rede doméstica ou escritório confiável
   - Não use em Wi-Fi público (cafés, aeroportos, etc.)

3. **Fechar Quando Não Usar:**
   - Quando terminar de desenvolver, feche o `npm run dev`
   - A regra de firewall continua, mas sem servidor rodando não há risco

4. **Desabilitar a Regra Quando Não Precisar:**
   - Abra `wf.msc`
   - Clique direito na regra "Next.js Dev Server - Tactical Ops Kanban"
   - Clique em "Desabilitar Regra"

### 🛡️ Para Produção

Para uso em produção:
1. **Não use `npm run dev`** - use build otimizado
2. **Configure HTTPS** com certificado válido
3. **Adicione autenticação** (login/senha)
4. **Use firewall mais restritivo** (apenas IPs específicos)
5. **Deploy em servidor dedicado** (Vercel, AWS, etc.)

---

## Comandos Úteis PowerShell

### Listar todas as regras de firewall na porta 3000
```powershell
Get-NetFirewallRule | Where-Object {$_.DisplayName -like "*3000*"} | Format-Table DisplayName, Enabled, Action
```

### Desabilitar a regra
```powershell
netsh advfirewall firewall set rule name="Next.js Dev Server - Tactical Ops Kanban" new enable=no
```

### Habilitar a regra
```powershell
netsh advfirewall firewall set rule name="Next.js Dev Server - Tactical Ops Kanban" new enable=yes
```

### Remover a regra completamente
```powershell
netsh advfirewall firewall delete rule name="Next.js Dev Server - Tactical Ops Kanban"
```

---

## Resumo

**Problema:** Windows Firewall bloqueando porta 3000

**Solução Rápida:**
```powershell
# Como Administrador
cd "C:\Users\mathe\OneDrive\Desktop\App\tactical-ops-kanban"
.\configure-firewall.ps1
```

**Teste:**
```
http://192.168.0.22:3000
```

**Pronto!** ✅ Agora o Kanban está acessível na rede local!
