# 🔧 Troubleshooting MCP Server - Claude Desktop

## ❌ Problema: MCP não está usando as ferramentas corretas

Se o Claude Desktop está usando `add_column` em vez de `create_project`, é porque ele ainda está usando a **versão antiga do MCP Server**.

---

## ✅ Solução: Reiniciar Claude Desktop

### Passo 1: Fechar completamente o Claude Desktop

**Opção A - Fechar pela bandeja do sistema:**
1. Clique com botão direito no ícone do Claude na **bandeja do sistema** (system tray)
2. Selecione **"Quit"** ou **"Sair"**

**Opção B - Forçar fechamento pelo Task Manager:**
1. Abra o **Gerenciador de Tarefas** (Ctrl+Shift+Esc)
2. Procure por **"Claude"** na lista de processos
3. Clique com botão direito → **"Finalizar Tarefa"**

### Passo 2: Verificar que o processo foi fechado

No Gerenciador de Tarefas, certifique-se de que **NÃO há nenhum processo** chamado:
- `Claude.exe`
- `claude-desktop.exe`
- `node.exe` (rodando o mcp-server.js)

### Passo 3: Reabrir o Claude Desktop

1. Abra o Claude Desktop normalmente
2. Aguarde 5-10 segundos para o MCP Server inicializar

---

## 🧪 Testar se Funcionou

Abra o Claude Desktop e pergunte:

```
Liste todos os projetos disponíveis
```

**Resposta esperada:**
O Claude deve usar a ferramenta `list_projects` e mostrar:
- Tactical Operations
- FomentaMais
- CREDITO
- Métricas Campanha C6 Bank 1° Tri
- CRIÇÃO DE NOVOS WEB APPS
- Arc Raiders

---

## 🆕 Ferramentas MCP v2.0 Disponíveis

Após reiniciar, estas ferramentas estarão disponíveis:

### Gerenciamento de Projetos:
- ✅ `list_projects` - Listar todos os projetos
- ✅ `create_project` - Criar novo projeto
- ✅ `delete_project` - Deletar projeto

### Gerenciamento de Tasks:
- ✅ `list_tasks` - Listar tasks (aceita projectId opcional)
- ✅ `add_task` - Criar task (aceita projectId opcional)
- ✅ `update_task` - Atualizar task (aceita projectId opcional)
- ✅ `delete_task` - Deletar task (aceita projectId opcional)

### Gerenciamento de Colunas:
- ✅ `list_columns` - Listar colunas (aceita projectId opcional)
- ✅ `add_column` - Criar coluna (aceita projectId opcional)
- ✅ `rename_column` - Renomear coluna (aceita projectId opcional)
- ✅ `delete_column` - Deletar coluna (aceita projectId opcional)

### Resumo:
- ✅ `get_board_summary` - Ver resumo do board (aceita projectId opcional)

---

## 📝 Exemplos de Uso Corretos

### Criar Projeto:
```
Cria um projeto chamado "Marketing 2025" com descrição "Campanhas de marketing do primeiro trimestre"
```

**O Claude vai usar:**
```javascript
create_project({
  name: "Marketing 2025",
  description: "Campanhas de marketing do primeiro trimestre"
})
```

### Deletar Projeto:
```
Delete o projeto "Tactical Operations"
```

**O Claude vai usar:**
```javascript
delete_project({
  projectId: "project-default"
})
```

### Criar Task em Projeto Específico:
```
Cria uma task "Revisar código" no projeto FomentaMais na coluna TODO
```

**O Claude vai usar:**
```javascript
add_task({
  title: "Revisar código",
  columnName: "TODO",
  projectId: "project-1767634611887-9e5fuai"
})
```

---

## 🔍 Como Verificar a Configuração MCP

### Localização do arquivo de config:
```
C:\Users\mathe\AppData\Roaming\Claude\claude_desktop_config.json
```

### Configuração correta:
```json
{
  "mcpServers": {
    "tactical-ops-kanban": {
      "command": "node",
      "args": ["C:\\Users\\mathe\\OneDrive\\Desktop\\App\\tactical-ops-kanban\\mcp-server.js"],
      "env": {
        "MCP_API_HOST": "http://localhost:3000"
      }
    }
  }
}
```

**Importante:**
- ✅ O caminho do `mcp-server.js` deve estar correto
- ✅ O servidor Next.js deve estar rodando em `http://localhost:3000`
- ✅ Não altere o `MCP_API_HOST` se estiver usando localmente

---

## ⚠️ Problemas Comuns

### 1. Claude ainda usa ferramentas antigas
**Causa:** Claude Desktop não foi totalmente fechado
**Solução:** Force o fechamento pelo Task Manager e reabra

### 2. Erro "Connection refused" ou "ECONNREFUSED"
**Causa:** Next.js não está rodando
**Solução:**
```bash
cd C:\Users\mathe\OneDrive\Desktop\App\tactical-ops-kanban
npm run dev
```

### 3. MCP Server não aparece no Claude
**Causa:** Configuração incorreta
**Solução:** Verifique o arquivo `claude_desktop_config.json`

### 4. Ferramentas aparecem mas dão erro
**Causa:** API não está respondendo
**Solução:**
1. Verifique se Next.js está rodando: `http://localhost:3000`
2. Teste a API manualmente:
```bash
curl http://localhost:3000/api/kanban/projects
```

---

## 🚀 Checklist Completo

Siga esta ordem para garantir que tudo funcione:

- [ ] 1. Next.js está rodando (`npm run dev`)
- [ ] 2. API responde em `http://localhost:3000/api/kanban/projects`
- [ ] 3. `claude_desktop_config.json` está configurado corretamente
- [ ] 4. Claude Desktop foi **completamente fechado** (Task Manager)
- [ ] 5. Claude Desktop foi reaberto
- [ ] 6. Aguardou 10 segundos após abrir
- [ ] 7. Testou com "Liste todos os projetos"
- [ ] 8. Claude usou `list_projects` (não `list_columns`)

---

## 📞 Se Ainda Não Funcionar

1. **Verifique os logs do MCP Server:**
   - Abra o Developer Tools no Claude Desktop (Ctrl+Shift+I)
   - Vá em "Console"
   - Procure por erros relacionados ao MCP

2. **Teste direto pela API:**
   ```bash
   # Listar projetos
   curl http://localhost:3000/api/kanban/projects

   # Criar projeto
   curl -X POST http://localhost:3000/api/kanban/projects \
     -H "Content-Type: application/json" \
     -d '{"name":"Test Project","description":"Testing"}'
   ```

3. **Reinicie TUDO:**
   - Feche Claude Desktop
   - Pare Next.js (Ctrl+C no terminal)
   - Inicie Next.js (`npm run dev`)
   - Abra Claude Desktop
   - Teste novamente

---

## ✅ Confirmação Final

Quando estiver funcionando corretamente, o Claude Desktop deve:

1. ✅ Usar `create_project` quando você pedir para criar projeto
2. ✅ Usar `delete_project` quando você pedir para deletar projeto
3. ✅ Usar `list_projects` quando você pedir para listar projetos
4. ✅ Mostrar a descrição do projeto ao listar
5. ✅ Conseguir criar tasks em projetos específicos

**Pronto! MCP Server v2.0 funcionando! 🎉**
