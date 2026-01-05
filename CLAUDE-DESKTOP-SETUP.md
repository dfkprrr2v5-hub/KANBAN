# Guia de Configuração do Claude Desktop - Tactical Ops Kanban

## 📋 Visão Geral

Este guia explica como conectar o **Claude Desktop App** ao servidor MCP do Tactical Ops Kanban, permitindo que você gerencie o Kanban board diretamente através de conversas com Claude.

**⚠️ IMPORTANTE:** Este guia foi atualizado para refletir a arquitetura atual (API HTTP + MCP Server). Configurações antigas podem não funcionar.

---

## 🏗️ Arquitetura Atual

```
Claude Desktop App
    ↓
MCP Server (mcp-server.js)
    ↓
API HTTP (Next.js)
    ↓
Arquivo de Dados (data/board.json)
    ↓
Web App (localhost:3000)
```

**Componentes:**
1. **Next.js API** - Roda em `http://localhost:3000` ou `http://192.168.0.87:3000`
2. **MCP Server** - Ponte entre Claude Desktop e a API HTTP
3. **Claude Desktop** - Interface para controlar o Kanban via chat

---

## 📍 Cenários de Uso

### Cenário 1: Uso Local (Mesmo PC)
- Claude Desktop no mesmo PC que roda o servidor Next.js
- **URL da API:** `http://localhost:3000`

### Cenário 2: Uso em Rede (Outros PCs)
- Claude Desktop em outro PC da rede local
- **URL da API:** `http://192.168.0.87:3000` (IP do PC servidor)

---

## 🚀 Configuração Passo a Passo

### Pré-requisitos

1. **Next.js rodando:**
   ```bash
   cd C:\Users\mathe\OneDrive\Desktop\App\tactical-ops-kanban
   npm run dev
   ```
   Deve mostrar: `- Local: http://localhost:3000`

2. **Claude Desktop instalado:**
   - Baixe em: https://claude.ai/download
   - Versão recomendada: mais recente disponível

---

## 🔧 Configuração no PC SERVIDOR (192.168.0.87)

### Passo 1: Verificar Arquivos do Projeto

Certifique-se de que estes arquivos existem:

```
tactical-ops-kanban/
├── mcp-server.js          ← Servidor MCP
├── .mcp.json              ← Config do projeto
├── package.json           ← Dependências
└── data/
    └── board.json         ← Dados do Kanban
```

### Passo 2: Configurar Claude Desktop

1. **Feche o Claude Desktop** completamente (se estiver aberto)

2. **Abra o arquivo de configuração:**
   ```
   C:\Users\mathe\AppData\Roaming\Claude\claude_desktop_config.json
   ```

3. **Cole esta configuração** (substitua TODO o conteúdo):

```json
{
  "mcpServers": {
    "tactical-ops-kanban": {
      "command": "node",
      "args": [
        "C:\\Users\\mathe\\OneDrive\\Desktop\\App\\tactical-ops-kanban\\mcp-server.js"
      ],
      "env": {
        "MCP_API_HOST": "http://localhost:3000"
      }
    }
  }
}
```

**⚠️ ATENÇÃO aos caminhos:**
- Use barras duplas `\\` no Windows
- Verifique se o caminho está correto para o seu PC
- Se o projeto estiver em outro lugar, ajuste o caminho completo

### Passo 3: Reiniciar Claude Desktop

1. **Feche completamente** o Claude Desktop
2. **Abra novamente**
3. **Verifique a conexão:**
   - No canto inferior direito, clique no ícone de **ferramentas (🔌)**
   - Deve aparecer: **"tactical-ops-kanban"** com status **conectado (verde)**

### Passo 4: Testar

No chat do Claude Desktop, digite:

```
Liste todas as tarefas do kanban
```

Ou:

```
Mostre um resumo do board
```

**Resultado esperado:**
- Claude deve listar as colunas e tarefas
- Se aparecer erro, veja a seção [Troubleshooting](#-troubleshooting)

---

## 🌐 Configuração em OUTRO PC da Rede

### Pré-requisitos

1. **Servidor Next.js rodando** no PC principal (192.168.0.87)
2. **Firewall configurado** no PC servidor
3. **Claude Desktop instalado** no PC cliente

### Passo 1: Testar Acesso à API

**No PC cliente**, abra o navegador e teste:

```
http://192.168.0.87:3000
```

**Deve funcionar!** Se não funcionar, veja [FIREWALL-SETUP.md](FIREWALL-SETUP.md)

### Passo 2: Criar Pasta do Projeto

No PC cliente, crie a pasta:

```
C:\tactical-ops-kanban-client\
```

### Passo 3: Copiar Arquivos Necessários

**Do PC servidor**, copie para o PC cliente:

1. **mcp-server.js**
2. **.mcp.json**
3. **package.json**

Você pode usar:
- Pen drive
- Compartilhamento de rede
- OneDrive/Google Drive
- E-mail

### Passo 4: Instalar Dependências

No PC cliente, abra PowerShell ou CMD:

```bash
cd C:\tactical-ops-kanban-client
npm install
```

### Passo 5: Configurar Claude Desktop

1. **Feche o Claude Desktop** (se estiver aberto)

2. **Abra/Crie o arquivo de configuração:**
   ```
   C:\Users\[SEU_USUARIO]\AppData\Roaming\Claude\claude_desktop_config.json
   ```

   **⚠️ Substitua** `[SEU_USUARIO]` pelo seu nome de usuário do Windows!

3. **Cole esta configuração:**

```json
{
  "mcpServers": {
    "tactical-ops-kanban": {
      "command": "node",
      "args": [
        "C:\\tactical-ops-kanban-client\\mcp-server.js"
      ],
      "env": {
        "MCP_API_HOST": "http://192.168.0.87:3000"
      }
    }
  }
}
```

**🔑 Diferenças importantes:**
- `MCP_API_HOST`: **`http://192.168.0.87:3000`** (IP do servidor, NÃO localhost!)
- Caminho do `mcp-server.js`: pasta local do PC cliente

### Passo 6: Reiniciar e Testar

1. Reinicie o Claude Desktop
2. Verifique conexão (ícone 🔌)
3. Teste: `"Liste todas as tarefas"`

---

## 🛠️ Comandos Disponíveis no Claude Desktop

Após conectar, você pode usar estes comandos naturalmente:

### Visualização
```
Mostre todas as tarefas
Liste as colunas do kanban
Dê um resumo do board
```

### Criar
```
Crie uma tarefa "Implementar login" na coluna "To Do"
Adicione uma coluna chamada "Em Revisão"
Crie 3 tarefas na coluna "Backlog": [lista]
```

### Atualizar
```
Mova a tarefa "Implementar login" para "In Progress"
Renomeie a coluna "To Do" para "Pendente"
Atualize a descrição da tarefa X para "..."
```

### Deletar
```
Delete a tarefa "Implementar login"
Remova a coluna "Done"
Apague todas as tarefas concluídas
```

---

## 🔍 Troubleshooting

### ❌ "tactical-ops-kanban" não aparece nos conectores

**Causa:** Configuração incorreta ou arquivo não encontrado

**Solução:**
1. Feche completamente o Claude Desktop
2. Verifique o caminho do `mcp-server.js` no `claude_desktop_config.json`
3. Certifique-se de usar `\\` (duplo) nos caminhos Windows
4. Verifique se o arquivo existe no caminho especificado
5. Reinicie o Claude Desktop

### ❌ Status "desconectado" (vermelho)

**Causa:** Servidor Next.js não está rodando ou API inacessível

**Solução:**

**No PC Servidor:**
```bash
cd C:\Users\mathe\OneDrive\Desktop\App\tactical-ops-kanban
npm run dev
```

**Verifique o endereço:**
- Uso local: `MCP_API_HOST` = `http://localhost:3000`
- Uso em rede: `MCP_API_HOST` = `http://192.168.0.87:3000`

**Teste a API manualmente:**
```
http://localhost:3000/api/kanban/board
ou
http://192.168.0.87:3000/api/kanban/board
```

Deve retornar JSON com os dados do board.

### ❌ "Connection timeout" ou erros de rede

**PC Servidor:**
1. Execute o diagnóstico:
   ```powershell
   .\diagnose-network.ps1
   ```

2. Configure o firewall:
   ```powershell
   .\configure-firewall.ps1
   ```

**PC Cliente:**
1. Teste no navegador: `http://192.168.0.87:3000`
2. Se não funcionar, o problema é de rede/firewall no servidor
3. Veja [FIREWALL-SETUP.md](FIREWALL-SETUP.md)

### ❌ Erro "Cannot find module" ou "npm not found"

**Causa:** Dependências não instaladas ou Node.js não instalado

**Solução:**
```bash
# Instalar Node.js (se não tiver)
# Baixe em: https://nodejs.org/

# Instalar dependências
cd C:\tactical-ops-kanban-client  # ou pasta do projeto
npm install
```

### ❌ Mudanças no Claude Desktop não aparecem no Web App

**Causa:** Problema de sincronização (raro, mas pode acontecer)

**Solução:**
1. Dê refresh (F5) no navegador
2. O web app tem auto-refresh a cada 5 segundos
3. Se continuar, reinicie o servidor Next.js:
   ```bash
   Ctrl+C  # parar
   npm run dev  # reiniciar
   ```

### ❌ "Error: ENOENT: no such file or directory, open 'data/board.json'"

**Causa:** Arquivo de dados não existe

**Solução:**
1. Acesse `http://localhost:3000/api/kanban/board` no navegador
2. A API cria automaticamente o arquivo com board padrão
3. Ou crie manualmente:
   ```bash
   mkdir data
   echo {} > data\board.json
   ```

---

## 📊 Verificação de Status

### Como saber se está tudo funcionando?

1. **Next.js rodando:**
   ```bash
   # No terminal deve mostrar:
   - Local: http://localhost:3000
   - Network: http://192.168.0.87:3000
   ```

2. **API respondendo:**
   - Abra: `http://localhost:3000/api/kanban/board`
   - Deve mostrar JSON (não erro)

3. **MCP conectado:**
   - Claude Desktop: ícone 🔌 → **"tactical-ops-kanban"** verde

4. **Teste funcional:**
   - No Claude: `"Liste as tarefas"`
   - Deve retornar lista de colunas e tarefas

---

## 🔄 Atualizando de Configuração Antiga

Se você tinha uma configuração antiga que usava `file://` ou acesso direto ao `data/board.json`:

### ❌ Configuração ANTIGA (NÃO usar):
```json
{
  "mcpServers": {
    "tactical-ops-kanban": {
      "command": "node",
      "args": ["mcp-server.js"],
      "cwd": "C:\\Users\\mathe\\OneDrive\\Desktop\\App\\tactical-ops-kanban"
    }
  }
}
```

### ✅ Configuração NOVA (usar):
```json
{
  "mcpServers": {
    "tactical-ops-kanban": {
      "command": "node",
      "args": [
        "C:\\Users\\mathe\\OneDrive\\Desktop\\App\\tactical-ops-kanban\\mcp-server.js"
      ],
      "env": {
        "MCP_API_HOST": "http://localhost:3000"
      }
    }
  }
}
```

**Mudanças principais:**
- ✅ Adicionado `env.MCP_API_HOST` (obrigatório!)
- ✅ Caminho completo no `args` (sem `cwd`)
- ✅ MCP agora usa API HTTP (não file:// direto)

---

## 🔒 Segurança

### ⚠️ Considerações de Segurança

1. **Rede Local Apenas:**
   - Este setup é para rede local confiável
   - Não exponha para a internet pública

2. **Sem Autenticação:**
   - A API não tem login/senha
   - Qualquer pessoa na rede pode acessar
   - Use apenas em ambiente controlado

3. **Desenvolvimento:**
   - Esta configuração é para **desenvolvimento**
   - Para produção, considere:
     - HTTPS com certificado
     - Autenticação (JWT, OAuth)
     - Firewall mais restritivo
     - Deploy em servidor dedicado

---

## 📝 Resumo Rápido

### PC Servidor (192.168.0.87)

```bash
# 1. Rodar Next.js
cd C:\Users\mathe\OneDrive\Desktop\App\tactical-ops-kanban
npm run dev

# 2. Configurar firewall (uma vez)
.\configure-firewall.ps1

# 3. Configurar Claude Desktop
# Editar: C:\Users\mathe\AppData\Roaming\Claude\claude_desktop_config.json
# MCP_API_HOST: http://localhost:3000
```

### PC Cliente (outros PCs)

```bash
# 1. Copiar arquivos (mcp-server.js, .mcp.json, package.json)
# 2. Instalar dependências
npm install

# 3. Configurar Claude Desktop
# MCP_API_HOST: http://192.168.0.87:3000
```

### Teste

```
Claude Desktop → 🔌 → "tactical-ops-kanban" (verde)
Chat: "Liste as tarefas"
```

---

## 🆘 Ainda com Problemas?

1. **Execute o diagnóstico completo:**
   ```powershell
   .\diagnose-network.ps1
   ```

2. **Verifique os logs do Claude Desktop:**
   ```
   C:\Users\[SEU_USUARIO]\AppData\Roaming\Claude\logs\
   ```

3. **Teste a API diretamente:**
   - Navegador: `http://192.168.0.87:3000/api/kanban/board`
   - Deve retornar JSON com os dados

4. **Verifique se Node.js está instalado:**
   ```bash
   node --version
   npm --version
   ```

5. **Reinstale as dependências:**
   ```bash
   rm -rf node_modules
   npm install
   ```

---

## ✅ Checklist de Configuração

- [ ] Node.js instalado
- [ ] Next.js rodando (`npm run dev`)
- [ ] Firewall configurado (PC servidor)
- [ ] API responde em `http://192.168.0.87:3000/api/kanban/board`
- [ ] `mcp-server.js` existe e está no caminho correto
- [ ] `claude_desktop_config.json` configurado corretamente
- [ ] `MCP_API_HOST` aponta para o endereço correto
- [ ] Claude Desktop reiniciado após configuração
- [ ] MCP aparece nos conectores (🔌) com status verde
- [ ] Teste funcional: `"Liste as tarefas"` funciona

---

**Pronto!** Agora você pode gerenciar seu Kanban board através do Claude Desktop! 🎉
