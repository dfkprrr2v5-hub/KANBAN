# Quick Start Guide - MCP Integration

## What You Just Got

I've implemented a complete MCP (Model Context Protocol) server that lets you control your Kanban board from Claude Code using natural language!

## 3-Minute Setup

### 1. Start Your App
```bash
npm run dev
```

### 2. Initialize the Board
Visit in your browser: `http://localhost:3000/api/kanban/board`

This creates the `data/board.json` file.

### 3. Test It Right Now!

Since you're already in Claude Code in this project, try these commands:

```
Show me all columns on my Kanban board

Add a new task "Test MCP integration" to the TODO column

List all tasks

Create a column called "Testing"
```

That's it! The MCP server is already configured (`.mcp.json` is in your project).

## What Can You Do?

### Task Operations
- ✅ "Add a task 'Fix bug' to TODO with high priority"
- ✅ "Show me all tasks"
- ✅ "Update task card-123 to critical priority"
- ✅ "Delete task card-456"
- ✅ "Move task card-789 to the Completed column"

### Column Operations
- ✅ "Create a new column called 'Code Review'"
- ✅ "List all columns"
- ✅ "Rename column col-todo to 'Backlog'"
- ✅ "Delete column col-testing"

### Board Overview
- ✅ "Give me a summary of my board"
- ✅ "What's the status of my Kanban board?"

## Architecture

```
You in Claude Code
       ↓
  Natural Language
       ↓
   MCP Server (mcp-server.js)
       ↓
  HTTP API (/api/kanban/*)
       ↓
  File Storage (data/board.json)
```

## Files Created

- ✅ `/app/api/kanban/tasks/route.ts` - Task CRUD API
- ✅ `/app/api/kanban/tasks/[id]/route.ts` - Individual task operations
- ✅ `/app/api/kanban/columns/route.ts` - Column CRUD API
- ✅ `/app/api/kanban/columns/[id]/route.ts` - Individual column operations
- ✅ `/app/api/kanban/board/route.ts` - Full board state
- ✅ `/lib/data/fileStorage.ts` - File-based storage helpers
- ✅ `/mcp-server.js` - MCP server implementation
- ✅ `/.mcp.json` - MCP configuration
- ✅ `/data/.gitkeep` - Ensures data directory exists
- ✅ `MCP-SETUP.md` - Full documentation
- ✅ `QUICK-START.md` - This file!

## Troubleshooting

**Issue:** Commands don't work
**Fix:** Make sure `npm run dev` is running

**Issue:** "Board not initialized"
**Fix:** Visit `http://localhost:3000/api/kanban/board`

**Issue:** "Task not found"
**Fix:** Run "list all tasks" first to see valid task IDs

## Full Documentation

See `MCP-SETUP.md` for complete documentation including:
- All available tools and parameters
- Example workflows
- Architecture details
- Advanced usage

## Test It Now!

Try this command in Claude Code right now:

```
Get a summary of my Kanban board
```

🎉 Enjoy controlling your Kanban board with natural language!
