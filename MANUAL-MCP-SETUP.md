# Como Conectar Outro PC ao MCP Kanban Manualmente

## Guia Completo para Configuração Manual via Interface do Claude Desktop

### Pré-requisitos no PC Host (Seu PC - 192.168.0.22)

1. ✅ Next.js dev server rodando (`npm run dev`)
2. ✅ Servidor acessível na rede em `http://192.168.0.22:3000`
3. ✅ Windows Firewall permitindo porta 3000

---

## Configuração no Outro PC (Cliente)

### Passo 1: Copiar o Arquivo do MCP Server

**Opção A: Via Rede (Recomendado)**

1. No **PC Host**, compartilhe a pasta do projeto:
   - Botão direito na pasta `tactical-ops-kanban`
   - Propriedades → Compartilhamento → Compartilhar
   - Adicione "Todos" com permissão de Leitura
   - Anote o caminho de rede (ex: `\\192.168.0.22\tactical-ops-kanban`)

2. No **PC Cliente**, acesse o compartilhamento:
   - Abra o Explorador de Arquivos
   - Na barra de endereço, digite: `\\192.168.0.22\tactical-ops-kanban`
   - Copie o arquivo `mcp-server.js` para o PC Cliente
   - Sugestão: Salve em `C:\Users\[SeuUsuario]\mcp-kanban\mcp-server.js`

**Opção B: Via Pendrive/Email**

1. Copie o arquivo `mcp-server.js` do PC Host
2. Cole no PC Cliente em: `C:\Users\[SeuUsuario]\mcp-kanban\mcp-server.js`

### Passo 2: Instalar Dependências no PC Cliente

1. Abra o **PowerShell** ou **CMD** no PC Cliente

2. Navegue até a pasta onde salvou o arquivo:
   ```bash
   cd C:\Users\[SeuUsuario]\mcp-kanban
   ```

3. Instale as dependências do MCP:
   ```bash
   npm install @modelcontextprotocol/sdk
   ```

   Isso cria uma pasta `node_modules` com as bibliotecas necessárias.

### Passo 3: Testar se Funciona

Antes de configurar no Claude Desktop, teste se o MCP server consegue se conectar à API:

```bash
# No PC Cliente
set MCP_API_HOST=http://192.168.0.22:3000
node mcp-server.js
```

Deve mostrar:
```
Tactical Ops Kanban MCP Server running on stdio
```

Se mostrar erro, verifique:
- O IP está correto? (`192.168.0.22`)
- O Next.js está rodando no PC Host?
- Consegue acessar `http://192.168.0.22:3000` no navegador do PC Cliente?

Pressione `Ctrl+C` para parar o teste.

---

## Configuração via Interface do Claude Desktop

### Método 1: Através da Interface (NOVO - Se disponível)

**Se o Claude Desktop tiver interface visual para MCP:**

1. Abra o **Claude Desktop App**
2. Vá em **Configurações** (Settings) ou **Preferências**
3. Procure a aba **"MCP Servers"** ou **"Conectores"**
4. Clique em **"Adicionar Servidor"** ou **"Add Server"**
5. Preencha os campos:

   **Nome/Name:**
   ```
   tactical-ops-kanban
   ```

   **Comando/Command:**
   ```
   node
   ```

   **Argumentos/Args:**
   ```
   C:\Users\[SeuUsuario]\mcp-kanban\mcp-server.js
   ```

   **⚠️ IMPORTANTE:** Use o caminho COMPLETO onde você salvou o arquivo!

   **Variáveis de Ambiente/Environment Variables:**
   - Clique em "Adicionar Variável" ou "Add Variable"
   - **Nome:** `MCP_API_HOST`
   - **Valor:** `http://192.168.0.22:3000`

6. Clique em **"Salvar"** ou **"Save"**

7. Reinicie o Claude Desktop completamente

### Método 2: Edição Manual do Arquivo de Configuração

**Se não houver interface visual, ou preferir fazer manualmente:**

1. **Feche COMPLETAMENTE o Claude Desktop**
   - Botão direito no ícone da bandeja → Sair
   - Ou Task Manager → Matar todos os processos "claude.exe"

2. **Abra o arquivo de configuração:**

   Pressione `Win+R` e digite:
   ```
   notepad %APPDATA%\Claude\claude_desktop_config.json
   ```

3. **Adicione a configuração do MCP:**

   O arquivo provavelmente está assim:
   ```json
   {
     "mcpServers": {
       "sequential-thinking": {
         "command": "npx",
         "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"]
       }
     }
   }
   ```

   **Adicione** o servidor do Kanban:
   ```json
   {
     "mcpServers": {
       "sequential-thinking": {
         "command": "npx",
         "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"]
       },
       "tactical-ops-kanban": {
         "command": "node",
         "args": ["C:\\Users\\[SeuUsuario]\\mcp-kanban\\mcp-server.js"],
         "env": {
           "MCP_API_HOST": "http://192.168.0.22:3000"
         }
       }
     }
   }
   ```

   **⚠️ ATENÇÃO:**
   - Substitua `[SeuUsuario]` pelo seu nome de usuário Windows
   - Use **barras duplas** `\\` nos caminhos Windows
   - Não esqueça a **vírgula** depois do `}` do sequential-thinking
   - Substitua `192.168.0.22` pelo IP correto do PC Host

4. **Salve o arquivo** (`Ctrl+S`)

5. **Reabra o Claude Desktop**

---

## Verificação

### 1. Verificar se o MCP Apareceu

1. Abra o Claude Desktop
2. Vá em **Configurações** → **MCP Servers** ou **Conectores**
3. Você deve ver:
   - ✅ `sequential-thinking` (Status: Connected)
   - ✅ `tactical-ops-kanban` (Status: Connected)

**Se aparecer "Error" ou "Disconnected":**
- Clique no servidor para ver detalhes do erro
- Verifique o caminho do arquivo
- Verifique se o IP está correto
- Verifique se o Next.js está rodando no PC Host

### 2. Testar os Comandos MCP

No Claude Desktop, pergunte:
```
What MCP tools are available?
```

Deve listar ferramentas como:
- `list_tasks`
- `add_task`
- `list_columns`
- `add_column`
- etc.

### 3. Teste Prático

Execute no Claude Desktop:
```
list_columns
```

Deve retornar as colunas do seu Kanban board!

Depois teste:
```
add_column com título "Teste do PC Cliente"
```

Vá no navegador do **PC Host** em `http://localhost:3000` e veja se a coluna aparece (aguarde 5 segundos)!

---

## Exemplo Completo de Configuração

**Cenário:**
- PC Host: `192.168.0.22` (onde o Next.js roda)
- PC Cliente: Qualquer outro PC na rede
- Usuário do PC Cliente: `joao`

**Passos:**

1. **Criar pasta no PC Cliente:**
   ```bash
   mkdir C:\Users\joao\mcp-kanban
   ```

2. **Copiar `mcp-server.js` para:**
   ```
   C:\Users\joao\mcp-kanban\mcp-server.js
   ```

3. **Instalar dependências:**
   ```bash
   cd C:\Users\joao\mcp-kanban
   npm install @modelcontextprotocol/sdk
   ```

4. **Configuração final no `claude_desktop_config.json`:**
   ```json
   {
     "mcpServers": {
       "tactical-ops-kanban": {
         "command": "node",
         "args": ["C:\\Users\\joao\\mcp-kanban\\mcp-server.js"],
         "env": {
           "MCP_API_HOST": "http://192.168.0.22:3000"
         }
       }
     }
   }
   ```

5. **Reiniciar Claude Desktop**

6. **Testar:**
   ```
   list_columns
   ```

---

## Troubleshooting

### "Connection refused" ou "Cannot connect to API"

**Problema:** O MCP server não consegue acessar a API do PC Host.

**Soluções:**

1. **Verificar se o PC Host está acessível:**
   ```bash
   # No PC Cliente, abra CMD ou PowerShell
   ping 192.168.0.22
   ```
   Se não responder, há problema de rede.

2. **Testar o acesso à API no navegador do PC Cliente:**
   ```
   http://192.168.0.22:3000/api/kanban/board
   ```
   Deve mostrar JSON com os dados do board.

3. **Configurar Windows Firewall no PC Host:**

   a. Abra **Windows Defender Firewall**

   b. Clique em **Configurações avançadas**

   c. **Regras de Entrada** → **Nova Regra**

   d. Tipo: **Porta**

   e. TCP → Porta específica: **3000**

   f. Ação: **Permitir a conexão**

   g. Perfil: Marque **todos** (Domínio, Privado, Público)

   h. Nome: **Next.js Dev Server - Kanban**

### "MCP Server not found" ou "Failed to start"

**Problema:** Claude Desktop não consegue executar o MCP server.

**Soluções:**

1. **Verificar o caminho do arquivo:**
   - O caminho está correto?
   - Use caminho ABSOLUTO completo
   - Barras duplas `\\` no Windows

2. **Verificar se Node.js está instalado:**
   ```bash
   node --version
   ```
   Deve mostrar algo como `v22.20.0`

3. **Verificar se as dependências foram instaladas:**
   ```bash
   dir C:\Users\[SeuUsuario]\mcp-kanban\node_modules
   ```
   Deve existir uma pasta `@modelcontextprotocol`

### MCP Server conecta mas comandos falham

**Problema:** MCP aparece como "Connected" mas os comandos retornam erro.

**Soluções:**

1. **Verificar a variável de ambiente `MCP_API_HOST`:**
   - Está configurada?
   - O IP está correto?
   - Tem `http://` no início?

2. **Testar manualmente:**
   ```bash
   set MCP_API_HOST=http://192.168.0.22:3000
   node C:\Users\[SeuUsuario]\mcp-kanban\mcp-server.js
   ```

   Digite qualquer coisa e pressione Enter. Veja se há erros.

### "Invalid JSON" ao editar o config

**Problema:** Erro de sintaxe no arquivo de configuração.

**Solução:**

Use um validador JSON online:
1. Copie todo o conteúdo do arquivo
2. Cole em https://jsonlint.com/
3. Clique em "Validate JSON"
4. Corrija os erros apontados

**Erros comuns:**
- Falta de vírgula entre objetos
- Vírgula extra no último item
- Falta de aspas em strings
- Barra simples `\` ao invés de dupla `\\`

---

## Resumo Rápido

**No PC Cliente:**

1. Copiar `mcp-server.js`
2. Instalar `npm install @modelcontextprotocol/sdk`
3. Configurar Claude Desktop com:
   - Command: `node`
   - Args: `C:\\Users\\[Usuario]\\mcp-kanban\\mcp-server.js`
   - Env: `MCP_API_HOST=http://192.168.0.22:3000`
4. Reiniciar Claude Desktop
5. Testar com `list_columns`

**No PC Host:**

1. Manter `npm run dev` rodando
2. Liberar porta 3000 no firewall (se necessário)

---

**Pronto!** Agora você pode controlar o Kanban de qualquer PC na rede! 🚀
