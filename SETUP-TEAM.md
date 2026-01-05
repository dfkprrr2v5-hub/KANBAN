# 📦 Configuração do Tactical Ops Kanban MCP para o Time

## 🎯 Opção 1: Instalação Local (Recomendado)

Cada membro do time roda sua própria instância do servidor.

### Passos para cada membro:

1. **Obter o código**
   - Clone o repositório ou copie a pasta do projeto
   - Caminho exemplo: `C:\Users\SEU-USUARIO\tactical-ops-kanban`

2. **Instalar dependências**
   ```bash
   cd tactical-ops-kanban
   npm install
   ```

3. **Iniciar o servidor Next.js**
   ```bash
   npm run dev
   ```
   O servidor irá rodar em `http://localhost:3000`

4. **Configurar Claude Desktop**

   **Windows:**
   - Abra o arquivo: `%APPDATA%\Claude\claude_desktop_config.json`
   - Adicione a configuração:

   ```json
   {
     "mcpServers": {
       "tactical-ops-kanban": {
         "command": "node",
         "args": ["C:\\Users\\SEU-USUARIO\\tactical-ops-kanban\\mcp-server.js"]
       }
     }
   }
   ```

   **Mac/Linux:**
   - Arquivo: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Configuração:

   ```json
   {
     "mcpServers": {
       "tactical-ops-kanban": {
         "command": "node",
         "args": ["/caminho/completo/para/tactical-ops-kanban/mcp-server.js"]
       }
     }
   }
   ```

5. **Reiniciar Claude Desktop**
   - Feche completamente o Claude Desktop
   - Abra novamente
   - Verifique se os tools aparecem (list_tasks, add_task, etc.)

---

## 🌐 Opção 2: Servidor Centralizado na Rede

Todos compartilham o mesmo board através de um servidor na rede.

### No servidor (computador que vai hospedar):

1. **Configurar IP estático ou hostname**
   - IP do servidor: `192.168.0.22`

2. **Instalar e rodar o servidor**
   ```bash
   cd tactical-ops-kanban
   npm install
   npm run build
   npm start -- -p 3000 -H 0.0.0.0
   ```

3. **Abrir porta no firewall**
   - Windows: Permitir porta 3000 no Windows Firewall
   - Linux: `sudo ufw allow 3000`

### Em cada computador do time:

1. **Copiar apenas o arquivo `mcp-server.js`**
   - Criar pasta: `C:\MCP-Servers\tactical-ops-kanban\`
   - Copiar o `mcp-server.js` para lá

2. **Instalar dependências MCP**
   ```bash
   cd C:\MCP-Servers\tactical-ops-kanban
   npm init -y
   npm install @modelcontextprotocol/sdk
   ```

3. **Configurar Claude Desktop com IP do servidor**

   Arquivo: `%APPDATA%\Claude\claude_desktop_config.json`

   ```json
   {
     "mcpServers": {
       "tactical-ops-kanban": {
         "command": "node",
         "args": ["C:\\MCP-Servers\\tactical-ops-kanban\\mcp-server.js"],
         "env": {
           "MCP_API_HOST": "http://192.168.0.22:3000"
         }
       }
     }
   }
   ```

   **O IP do servidor já está configurado: `192.168.0.22`**

4. **Reiniciar Claude Desktop**

---

## ✅ Testando a Instalação

Após configurar, abra o Claude Desktop e teste:

```
Liste todas as tarefas do kanban
```

Se funcionar, você verá os tools do MCP em ação!

---

## 🔧 Troubleshooting

### Erro: "Cannot find module"
- Certifique-se que executou `npm install` na pasta do projeto

### MCP Server não aparece no Claude
- Verifique se o caminho no config está correto
- Reinicie o Claude Desktop completamente
- Verifique o arquivo de log: `%APPDATA%\Claude\logs\`

### API não conecta (Opção 2)
- Verifique se o servidor está rodando: `curl http://IP-SERVIDOR:3000/api/kanban/board`
- Verifique firewall e rede
- Ping no servidor: `ping IP-SERVIDOR`

---

## 📞 Precisa de ajuda?

Entre em contato com o administrador do sistema ou revise a documentação do MCP:
https://modelcontextprotocol.io/
