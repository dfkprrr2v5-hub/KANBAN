# Instruções de Atualização - Tactical Ops Kanban

## 📥 Para atualizar no outro PC:

### 1. Puxar as últimas alterações do GitHub

```bash
git pull origin main
```

### 2. Instalar dependências (se houver novas)

```bash
npm install
```

### 3. Verificar variáveis de ambiente

Certifique-se de que o arquivo `.env.local` existe com:

```env
NEXT_PUBLIC_GROQ_API_KEY=sua_chave_aqui
```

### 4. Iniciar o servidor

```bash
npm run dev
```

---

## 🎉 Novidades nesta atualização:

### ✨ Sistema de Sugestão de Descrição por IA

- Quando você pedir para criar uma task ou projeto via AI Chat, a IA **automaticamente sugere uma descrição**
- Você pode **editar a descrição** antes de confirmar
- Botões **Accept** e **Cancel** para controle total

**Como usar:**
1. Abra o AI Chat (Ctrl+Space ou botão AI)
2. Digite: "Cria uma task para corrigir o bug de login"
3. A IA sugere uma descrição detalhada
4. Edite se quiser e clique em Accept

### 🏗️ Sistema Multi-Projetos Completo

- **Sidebar lateral** com menu de projetos (botão Menu ao lado do título)
- **CRUD completo**: criar, editar, deletar e alternar entre projetos
- Cada projeto tem seu **próprio board independente**
- **Migração automática**: seus dados antigos são preservados no "Tactical Operations"

### 🐛 Correções de Bugs

- ✅ Corrigidos erros 404 ao atualizar tasks
- ✅ Corrigidos erros 404 ao atualizar colunas
- ✅ Corrigido drag & drop entre colunas
- ✅ Todas as operações agora respeitam o projeto atual

### 🔧 MCP Server v2.0

- **3 novas ferramentas**: `list_projects`, `create_project`, `delete_project`
- **Todas as ferramentas antigas** agora aceitam `projectId` opcional
- **Retrocompatível**: funciona sem especificar projeto (usa o padrão)

**Ferramentas MCP atualizadas:**
```javascript
// Listar projetos
list_projects()

// Criar projeto
create_project({ name: "Meu Projeto", description: "Descrição" })

// Criar task em projeto específico
add_task({
  title: "Task",
  columnName: "TODO",
  projectId: "project-123" // opcional
})
```

---

## 📊 Arquitetura de Dados

### Antes (single board):
```
data/board.json
```

### Agora (multi-project):
```
data/
├── projects.json          # Índice de projetos
└── boards/
    ├── project-default.json
    ├── project-123.json
    └── project-456.json
```

**Nota:** Cada desenvolvedor terá seus próprios dados locais (não versionados no git).

---

## 🔥 Recursos Principais

### AI Chat com Sugestões
- Ctrl+Space para abrir
- Comandos em português ou inglês
- Descrições automáticas para tasks/projetos
- Edição antes de confirmar

### Gerenciamento de Projetos
- Menu lateral (botão à esquerda do título)
- Criar novo projeto
- Editar nome/descrição
- Deletar projeto (com confirmação)
- Alternar entre projetos

### Operações Multi-Projeto
- Tasks isoladas por projeto
- Colunas independentes por projeto
- Histórico separado (undo/redo por projeto)
- Sem vazamento de dados entre projetos

---

## ⚙️ Configuração do MCP Server (Claude Desktop)

Se você usa Claude Desktop, o MCP server foi atualizado para v2.0.

**Nenhuma ação necessária** - a configuração existente continua funcionando!

O servidor agora suporta múltiplos projetos automaticamente.

---

## 🆘 Problemas Comuns

### "Failed to update task"
- ✅ **Corrigido nesta versão!** Era um bug onde o projectId não era passado.

### Dados antigos não aparecem
- Seus dados foram migrados automaticamente para `data/boards/project-default.json`
- Backup criado em `data/board.json.backup`

### Projetos não aparecem
1. Verifique se `data/projects.json` existe
2. Se não existir, será criado automaticamente na primeira execução
3. Refresh a página (F5)

---

## 📝 Mudanças Técnicas

**Arquivos novos:**
- `types/project.ts` - Tipos TypeScript para projetos
- `lib/store/projectStore.ts` - State management de projetos
- `components/sidebar/ProjectSidebar.tsx` - Menu lateral
- `components/sidebar/ProjectListItem.tsx` - Item de projeto
- `components/sidebar/ProjectModal.tsx` - Modal criar/editar
- `app/api/kanban/projects/route.ts` - API de projetos
- `app/api/kanban/projects/[id]/route.ts` - API projeto individual

**Arquivos modificados:**
- `mcp-server.js` - v2.0 com suporte multi-projeto
- `lib/services/aiService.ts` - Sugestão de descrição
- `lib/store/aiStore.ts` - Estado de sugestões pendentes
- `components/ai/AICommandChat.tsx` - UI de sugestões
- `lib/store/boardStore.ts` - Correção de bugs projectId
- Todas as rotas de API - Suporte a projectId query param

**Total de mudanças:**
- ✅ 24 arquivos modificados
- ✅ 1825 linhas adicionadas
- ✅ 139 linhas removidas

---

## 🎯 Próximos Passos

Após atualizar:

1. ✅ Teste criar um novo projeto
2. ✅ Teste a sugestão de descrição via AI Chat
3. ✅ Verifique que suas tasks antigas estão no projeto "Tactical Operations"
4. ✅ Teste alternar entre projetos

---

**Versão:** 2.0.0
**Data:** 2025-01-05
**Commit:** 367d11f

🤖 Atualização preparada por [Claude Code](https://claude.com/claude-code)
