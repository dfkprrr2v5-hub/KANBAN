# Network Setup - Multi-PC MCP Access

This guide explains how to let multiple PCs on your network connect their Claude desktop apps to the same Kanban board API.

## Architecture

```
┌─────────────────────┐
│   Host PC           │
│   (192.168.0.22)    │
│                     │
│   Next.js Server    │
│   Port 3001         │
│   data/board.json   │
└──────────┬──────────┘
           │
    Local Network
    192.168.0.x
           │
     ┌─────┴──────┬──────────┐
     │            │          │
┌────▼────┐  ┌───▼───┐  ┌──▼────┐
│ Your PC │  │ PC #2 │  │ PC #3 │
│         │  │       │  │       │
│ Claude  │  │Claude │  │Claude │
│ Desktop │  │Desktop│  │Desktop│
└─────────┘  └───────┘  └───────┘
```

## Current Network Info

**Your PC IP:** `192.168.0.22`
**Next.js Server:** `http://192.168.0.22:3001`

## Setup Instructions

### On Host PC (Where Next.js Runs)

#### 1. Keep Next.js Running
```bash
npm run dev
```

Make sure it shows:
```
- Network:  http://192.168.0.22:3001
```

#### 2. Your Claude Desktop Config
Location: `C:\Users\mathe\AppData\Roaming\Claude\claude_desktop_config.json`

Already configured to use `localhost:3001`:
```json
{
  "mcpServers": {
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

### On Other PCs (Network Clients)

#### 1. Copy the MCP Server File

**Option A: Share the File**
1. Share the project folder on your network
2. Access it from the other PC (e.g., `\\192.168.0.22\tactical-ops-kanban`)

**Option B: Copy the File**
Copy `mcp-server.js` to the other PC, for example:
```
C:\Users\[username]\mcp-server.js
```

#### 2. Install Node.js
Make sure Node.js is installed on the other PC.

#### 3. Install MCP SDK on Other PC
```bash
# In the directory where mcp-server.js is located
npm install @modelcontextprotocol/sdk
```

#### 4. Configure Claude Desktop on Other PC

Edit: `C:\Users\[username]\AppData\Roaming\Claude\claude_desktop_config.json`

Add this configuration (replace with your host PC's IP):

```json
{
  "mcpServers": {
    "tactical-ops-kanban": {
      "command": "node",
      "args": ["C:\\Users\\[username]\\mcp-server.js"],
      "env": {
        "MCP_API_HOST": "http://192.168.0.22:3001"
      }
    }
  }
}
```

**Important:** Use your host PC's network IP (`192.168.0.22`), NOT `localhost`!

#### 5. Restart Claude Desktop

Close and restart Claude desktop app on the other PC.

#### 6. Test It

Try these commands:
```
What MCP tools are available?

Show me all tasks on my Kanban board

Add a task "Testing from PC #2" to the TODO column
```

## Firewall Considerations

If the other PC can't connect:

### Windows Firewall (Host PC)

1. Open Windows Defender Firewall
2. Click "Advanced settings"
3. Click "Inbound Rules" → "New Rule"
4. Port rule → TCP → Port `3001`
5. Allow the connection
6. Apply to all profiles
7. Name it "Next.js Dev Server"

### Quick Test

From the other PC, open a browser and visit:
```
http://192.168.0.22:3001/api/kanban/board
```

If you see JSON data, the connection works!

## Shared vs Individual Storage

### Current Setup (Shared Board)
All PCs work on the **same board** (`data/board.json` on host PC).

**Pros:**
- ✅ Everyone sees the same tasks
- ✅ Real-time collaboration
- ✅ Single source of truth

**Cons:**
- ❌ Host PC must be running
- ❌ No offline access

### Alternative: Individual Boards

Each PC can run its own Next.js server with its own `data/board.json`:

1. Copy the entire project to each PC
2. Run `npm run dev` on each PC
3. Configure MCP to use `localhost` on each PC

## Troubleshooting

### "Connection refused" or "Cannot connect"

**Check:**
1. Is Next.js running on host PC? (`npm run dev`)
2. Is the host PC IP correct? (Check with `ipconfig`)
3. Is Windows Firewall blocking port 3001?
4. Can you ping the host PC from the other PC?

**Test:**
```bash
# From the other PC
ping 192.168.0.22
```

### "API call failed"

**Check:**
1. Can you access the API in a browser?
   ```
   http://192.168.0.22:3001/api/kanban/board
   ```
2. Is the `MCP_API_HOST` environment variable set correctly?

### MCP Tools Not Showing

**Check:**
1. Did you restart Claude desktop app?
2. Is the path to `mcp-server.js` correct in the config?
3. Is Node.js installed and in PATH?

## Network Changes

If your host PC's IP changes (e.g., after router restart):

1. Find the new IP:
   ```bash
   ipconfig
   ```
   Look for "IPv4 Address" under your network adapter

2. Update the `MCP_API_HOST` on all other PCs' Claude configs

3. Restart Claude desktop apps

## Security Notes

⚠️ **This setup is for LOCAL NETWORK ONLY**

- Don't expose your Next.js dev server to the internet
- Only works on trusted local networks (home/office)
- No authentication is implemented
- All PCs can read/write/delete all data

## Production Deployment

For internet access or better security, consider:

1. Deploy Next.js to Vercel/Netlify
2. Add a real database (PostgreSQL, Vercel KV)
3. Implement authentication
4. Use HTTPS
5. Update MCP_API_HOST to the production URL

---

**Questions?** See the main `MCP-SETUP.md` for more details.
