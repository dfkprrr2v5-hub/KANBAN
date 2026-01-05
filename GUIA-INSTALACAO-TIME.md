# 🚀 Guia de Instalação - Tactical Ops Kanban MCP

## Para cada membro do time

### 📥 Passo 1: Baixar o projeto

```bash
git clone https://github.com/dfkprrr2v5-hub/KANBAN.git
cd KANBAN
```

**OU** copie a pasta do projeto da rede compartilhada.

---

### 📦 Passo 2: Instalar dependências

Abra o **Prompt de Comando** ou **PowerShell** na pasta do projeto:

```bash
npm install
```

Aguarde a instalação terminar (pode demorar alguns minutos).

---

### ⚙️ Passo 3: Configurar o Claude Desktop

#### Opção A: Configuração Automática (Recomendado)

1. **Duplo clique** no arquivo: `configure-client.bat`
2. Quando perguntar o IP do servidor, **apenas aperte ENTER** (já vem configurado: `192.168.0.22`)
3. Pronto! ✅

#### Opção B: Configuração Manual

1. **Abra o arquivo de configuração do Claude:**

   **Windows:**
   - Pressione `Win + R`
   - Digite: `%APPDATA%\Claude`
   - Aperte Enter
   - Se não existir o arquivo `claude_desktop_config.json`, crie um novo arquivo de texto e renomeie para `claude_desktop_config.json`

2. **Edite o arquivo** `claude_desktop_config.json` com este conteúdo:

   ```json
   {
     "mcpServers": {
       "tactical-ops-kanban": {
         "command": "node",
         "args": ["C:\\CAMINHO\\COMPLETO\\PARA\\KANBAN\\mcp-server.js"],
         "env": {
           "MCP_API_HOST": "http://192.168.0.22:3000"
         }
       }
     }
   }
   ```

   **⚠️ IMPORTANTE:** Substitua `C:\\CAMINHO\\COMPLETO\\PARA\\KANBAN\\` pelo caminho real onde você copiou a pasta!

   **Exemplo:**
   ```json
   "args": ["C:\\Users\\SEU-NOME\\KANBAN\\mcp-server.js"]
   ```

3. **Salve o arquivo**

---

### 🔄 Passo 4: Reiniciar o Claude Desktop

1. **Feche completamente** o Claude Desktop (verifique na bandeja do sistema)
2. **Abra novamente** o Claude Desktop

---

### ✅ Passo 5: Testar

No Claude Desktop, escreva:

```
Liste todas as tarefas do kanban
```

Se funcionar, você verá as ferramentas MCP em ação! 🎉

---

## ❓ Problemas Comuns

### Erro: "MCP Server não aparece"

**Solução:**
1. Verifique se o caminho no `claude_desktop_config.json` está correto
2. Certifique-se de usar `\\` (duas barras invertidas) no Windows
3. Reinicie o Claude Desktop completamente

### Erro: "Cannot find module"

**Solução:**
1. Verifique se executou `npm install` na pasta do projeto
2. Certifique-se de que o arquivo `mcp-server.js` existe

### Erro: "Failed to connect to server"

**Solução:**
1. Verifique se o servidor está rodando no IP `192.168.0.22:3000`
2. Teste no navegador: http://192.168.0.22:3000
3. Verifique se está na mesma rede

### Como ver se está funcionando?

1. Abra o Claude Desktop
2. Procure por um ícone de ferramentas ou "MCP" na interface
3. Tente usar comandos como "liste as tarefas"

---

## 🔧 Verificando o caminho correto

Para descobrir o caminho completo da pasta do projeto:

**Windows:**
1. Abra a pasta do projeto no Explorador de Arquivos
2. Clique na barra de endereço no topo
3. Copie o caminho (ex: `C:\Users\SeuNome\KANBAN`)
4. No arquivo JSON, use: `C:\\Users\\SeuNome\\KANBAN\\mcp-server.js`
   (Note as **barras duplas**: `\\`)

---

## 📞 Precisa de ajuda?

Entre em contato com o administrador do sistema.

---

## 🎯 Comandos disponíveis no Claude

Após configurar, você pode usar:

- "Liste todas as tarefas"
- "Crie uma nova tarefa chamada [nome]"
- "Mova a tarefa X para a coluna Y"
- "Mostre o resumo do board"
- E muito mais!
