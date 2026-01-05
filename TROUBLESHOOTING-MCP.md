# Troubleshooting - MCP não aparece no Claude Desktop

## Problema
O MCP server "tactical-ops-kanban" não aparece na aba de conectores do Claude Desktop.

## Verificações

### ✅ O que já está funcionando:
- Node.js instalado (v22.20.0)
- MCP server funciona quando executado manualmente
- Arquivo de configuração está correto em: `C:\Users\mathe\AppData\Roaming\Claude\claude_desktop_config.json`

## Solução Passo a Passo

### 1. Fechar COMPLETAMENTE o Claude Desktop

**IMPORTANTE:** Não basta apenas fechar a janela!

1. Clique com botão direito na bandeja do sistema (system tray, perto do relógio)
2. Procure o ícone do Claude
3. Clique direito → **Sair** ou **Quit**
4. Ou use o Task Manager:
   - Pressione `Ctrl+Shift+Esc`
   - Procure todos os processos "claude.exe"
   - Clique direito → "End Task" em TODOS eles

### 2. Aguarde 5 segundos

Dê tempo para o Claude Desktop liberar todos os recursos.

### 3. Reabrir o Claude Desktop

Abra normalmente pelo menu Iniciar ou atalho.

### 4. Verificar na aba de Conectores/MCP

1. Abra as configurações do Claude Desktop
2. Vá para a aba "MCP" ou "Conectores"
3. Você deve ver:
   - ✅ sequential-thinking (já existente)
   - ✅ tactical-ops-kanban (novo)

## Se AINDA não aparecer:

### Opção A: Verificar Sintaxe do JSON

Abra o arquivo de configuração e verifique se está EXATAMENTE assim:

```json
{
  "mcpServers": {
    "sequential-thinking": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"]
    },
    "tactical-ops-kanban": {
      "command": "node",
      "args": ["C:\\Users\\mathe\\OneDrive\\Desktop\\App\\tactical-ops-kanban\\mcp-server.js"],
      "env": {
        "MCP_API_HOST": "http://localhost:3001"
      }
    }
  }
}
```

**Atenção:**
- Vírgula depois do `}` do sequential-thinking
- Barras duplas `\\` no caminho Windows
- Sem vírgula depois do último `}`

### Opção B: Verificar os Logs do Claude

1. Vá para: `C:\Users\mathe\AppData\Roaming\Claude\logs`
2. Abra o arquivo de log mais recente
3. Procure por erros relacionados a "tactical-ops-kanban" ou "mcp-server.js"
4. Se houver erro, me mostre

### Opção C: Testar Manualmente se o Caminho Está Correto

Abra o PowerShell ou CMD e execute:

```bash
node "C:\Users\mathe\OneDrive\Desktop\App\tactical-ops-kanban\mcp-server.js"
```

Deve mostrar:
```
Tactical Ops Kanban MCP Server running on stdio
```

Se mostrar erro, o caminho está incorreto.

### Opção D: Usar Caminho Relativo (Alternativa)

Se o caminho absoluto não funcionar, tente criar um script wrapper:

1. Crie `C:\Users\mathe\mcp-kanban-wrapper.bat`:
   ```bat
   @echo off
   cd /d "C:\Users\mathe\OneDrive\Desktop\App\tactical-ops-kanban"
   node mcp-server.js
   ```

2. Altere o config para:
   ```json
   "tactical-ops-kanban": {
     "command": "C:\\Users\\mathe\\mcp-kanban-wrapper.bat",
     "args": []
   }
   ```

## Verificação Final

Quando funcionar, você deve ver na aba de conectores:

```
✓ tactical-ops-kanban
  Status: Connected
  9 tools available
```

E os tools devem ser:
- list_tasks
- add_task
- update_task
- delete_task
- list_columns
- add_column
- rename_column
- delete_column
- get_board_summary

## Teste Rápido

Quando aparecer, teste com:

1. Certifique-se que `npm run dev` está rodando
2. No Claude Desktop, pergunte:
   ```
   What MCP tools are available?
   ```

3. Depois teste:
   ```
   Show me all columns on my Kanban board
   ```

## Ainda não funciona?

### Debug Avançado

1. **Verificar permissões:**
   - O arquivo `mcp-server.js` tem permissão de leitura?
   - O Node.js está no PATH do sistema?

2. **Verificar PATH do Node:**
   ```bash
   where node
   ```
   Deve mostrar: `C:\Program Files\nodejs\node.exe` ou similar

3. **Testar com caminho absoluto do node:**
   ```json
   "tactical-ops-kanban": {
     "command": "C:\\Program Files\\nodejs\\node.exe",
     "args": ["C:\\Users\\mathe\\OneDrive\\Desktop\\App\\tactical-ops-kanban\\mcp-server.js"],
     "env": {
       "MCP_API_HOST": "http://localhost:3001"
     }
   }
   ```

## Informações Úteis

**Localização do config:**
```
C:\Users\mathe\AppData\Roaming\Claude\claude_desktop_config.json
```

**Localização do MCP server:**
```
C:\Users\mathe\OneDrive\Desktop\App\tactical-ops-kanban\mcp-server.js
```

**Versão do Node.js:**
```
v22.20.0
```

---

**Dica:** Sempre que modificar o `claude_desktop_config.json`, você DEVE fechar completamente e reabrir o Claude Desktop!
