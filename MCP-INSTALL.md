# 🚀 Guia Rápido de Instalação - MCP Server

## 🎯 Escolha sua opção:

### **Opção 1: Uso Individual** ⭐ Recomendado para começar

Cada pessoa roda seu próprio servidor local.

**Passos simples:**

1. **Clone/copie** este projeto para seu computador
2. **Execute:** `install-mcp.bat` (duplo clique)
3. **Copie a configuração** que aparecer para o arquivo do Claude Desktop
4. **Reinicie** o Claude Desktop

Pronto! ✅

---

### **Opção 2: Servidor Compartilhado na Rede** 🌐

Todos do time usam o mesmo Kanban centralizado.

#### 🖥️ **No servidor (1 computador apenas):**

1. Execute: `setup-network-server.bat`
2. IP do servidor: `192.168.0.22:3000`
3. Configure o firewall quando solicitado
4. Mantenha o servidor rodando

#### 💻 **Em cada computador do time:**

1. Copie a pasta do projeto
2. Execute: `configure-client.bat`
3. Digite o IP do servidor quando solicitado
4. Reinicie o Claude Desktop

Pronto! ✅

---

## 📝 Testando

Abra o Claude Desktop e pergunte:

```
Liste todas as tarefas do kanban
```

Se funcionar, você verá os tools MCP em ação!

---

## ❓ Problemas?

Veja o arquivo `SETUP-TEAM.md` para troubleshooting detalhado.

---

## 🔧 Scripts Disponíveis

- `install-mcp.bat` - Instalação rápida local
- `start-server.bat` - Inicia o servidor Next.js
- `setup-network-server.bat` - Configura servidor de rede
- `configure-client.bat` - Configura cliente para servidor de rede

---

## 📚 Tools Disponíveis

Após instalar, você pode usar estes comandos no Claude:

- `list_tasks` - Listar todas as tarefas
- `add_task` - Criar nova tarefa
- `update_task` - Atualizar tarefa
- `delete_task` - Deletar tarefa
- `list_columns` - Listar colunas
- `add_column` - Criar coluna
- `rename_column` - Renomear coluna
- `delete_column` - Deletar coluna
- `get_board_summary` - Resumo do board
