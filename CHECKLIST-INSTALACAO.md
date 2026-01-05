# ✓ Checklist de Instalação - Kanban MCP

## Versão Ultra-Simplificada

### □ PASSO 1: Copiar a pasta do projeto
- [ ] Baixei ou copiei a pasta `KANBAN` para o meu computador
- [ ] Sei o caminho completo (ex: `C:\Users\MeuNome\KANBAN`)

---

### □ PASSO 2: Instalar dependências
- [ ] Abri o Prompt de Comando na pasta do projeto
- [ ] Executei: `npm install`
- [ ] Aguardei finalizar (sem erros)

---

### □ PASSO 3: Configurar Claude Desktop

**Opção Fácil:**
- [ ] Duplo clique em: `configure-client.bat`
- [ ] Apertei ENTER quando pediu o IP

**OU Opção Manual:**
- [ ] Abri: `%APPDATA%\Claude\claude_desktop_config.json`
- [ ] Copiei o exemplo do arquivo `EXEMPLO-CONFIG-CLIENTE.json`
- [ ] Alterei o caminho para o caminho correto no meu PC
- [ ] Salvei o arquivo

---

### □ PASSO 4: Reiniciar Claude Desktop
- [ ] Fechei completamente o Claude Desktop
- [ ] Abri novamente

---

### □ PASSO 5: Testar
- [ ] Perguntei no Claude: "Liste todas as tarefas do kanban"
- [ ] Funcionou! ✅

---

## 🆘 SE NÃO FUNCIONAR:

1. ❌ Verifique se usou `\\` (barras duplas) no caminho
2. ❌ Confirme que executou `npm install`
3. ❌ Certifique-se de reiniciar o Claude Desktop
4. ❌ Teste se o servidor está respondendo: http://192.168.0.22:3000

---

## 📋 Exemplo de configuração correta:

```json
{
  "mcpServers": {
    "tactical-ops-kanban": {
      "command": "node",
      "args": ["C:\\Users\\MeuNome\\KANBAN\\mcp-server.js"],
      "env": {
        "MCP_API_HOST": "http://192.168.0.22:3000"
      }
    }
  }
}
```

**LEMBRE-SE:** Trocar `C:\\Users\\MeuNome\\KANBAN` pelo SEU caminho!
