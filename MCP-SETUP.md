# Tactical Ops Kanban - MCP Server Setup Guide

This guide will help you set up and use the Model Context Protocol (MCP) server to control your Kanban board directly from Claude Code.

## What is MCP?

MCP (Model Context Protocol) allows Claude Code to interact with external tools and services. With this MCP server, you can:

- Add, edit, and delete tasks using natural language
- Create and manage columns
- Get board summaries
- All from within Claude Code!

## Prerequisites

1. **Next.js dev server running**: Your app must be running on `http://localhost:3000`
2. **Node.js**: Already installed (you're using it for Next.js)
3. **Claude Code**: Desktop app or CLI

## Setup Instructions

### Step 1: Start Your Next.js App

```bash
npm run dev
```

Make sure it's running on port 3000. The API endpoints are now available at:
- `http://localhost:3000/api/kanban/tasks`
- `http://localhost:3000/api/kanban/columns`
- `http://localhost:3000/api/kanban/board`

### Step 2: Initialize the Board

The first time you use the MCP server, it will create a `data/board.json` file with the default board structure. You can also initialize it manually by visiting:

```
http://localhost:3000/api/kanban/board
```

### Step 3: Configure MCP in Claude Code

The `.mcp.json` file has already been created for you. Claude Code will automatically detect it in this project.

If you're using the Claude Code CLI, restart it:
```bash
# Exit Claude Code and restart
claude
```

If you're using the desktop app, restart the app to load the new MCP server.

### Step 4: Verify MCP Server is Running

In Claude Code, you can check if the MCP server is loaded by asking:

```
What MCP tools are available?
```

You should see tools like `add_task`, `list_tasks`, `delete_task`, etc.

## Available MCP Tools

### Task Management

#### 1. `list_tasks`
Get all tasks from the board.

**Example:**
```
Show me all tasks
```

#### 2. `add_task`
Create a new task.

**Parameters:**
- `title` (required): Task title
- `columnName` (required): Column name (e.g., "TODO", "In Progress", "Completed")
- `description` (optional): Task description
- `priority` (optional): "low", "medium", "high", or "critical"

**Examples:**
```
Add a new task "Setup authentication" to the TODO column with high priority

Create a task called "Fix navbar bug" in the In Progress column
```

#### 3. `update_task`
Update an existing task.

**Parameters:**
- `taskId` (required): Task ID
- `title` (optional): New title
- `description` (optional): New description
- `priority` (optional): New priority
- `columnId` (optional): Move to a different column

**Examples:**
```
Update task card-123 to have high priority

Move task card-456 to the Completed column
```

#### 4. `delete_task`
Delete a task from the board.

**Parameters:**
- `taskId` (required): Task ID to delete

**Examples:**
```
Delete task card-789

Remove the task with ID card-123
```

### Column Management

#### 5. `list_columns`
Get all columns in the board.

**Example:**
```
Show me all columns
```

#### 6. `add_column`
Create a new column.

**Parameters:**
- `title` (required): Column title

**Examples:**
```
Create a new column called "Testing"

Add a column named "Code Review"
```

#### 7. `rename_column`
Rename an existing column.

**Parameters:**
- `columnId` (required): Column ID
- `newTitle` (required): New column title

**Examples:**
```
Rename column col-todo to "Backlog"
```

#### 8. `delete_column`
Delete a column and all its tasks.

**Parameters:**
- `columnId` (required): Column ID to delete

**⚠️ WARNING:** This will delete ALL tasks in the column. Cannot be undone.

**Examples:**
```
Delete column col-completed
```

### Board Overview

#### 9. `get_board_summary`
Get a summary of the entire board.

**Example:**
```
Give me a summary of my board

What's the current state of my Kanban board?
```

## Example Workflow

Here's a typical workflow using Claude Code with MCP:

```
You: What's the current state of my board?
Claude: [Calls get_board_summary and shows you the summary]

You: Add a high-priority task "Implement OAuth" to the TODO column
Claude: [Calls add_task and confirms the task was created]

You: Show me all tasks
Claude: [Calls list_tasks and displays all tasks]

You: Move task card-abc123 to the In Progress column
Claude: [Calls update_task with columnId and confirms the move]

You: Delete task card-def456
Claude: [Calls delete_task and confirms deletion]
```

## Troubleshooting

### MCP Server Not Found

**Problem:** Claude Code says it can't find the MCP server.

**Solution:**
1. Make sure you're in the project directory
2. Verify `.mcp.json` exists
3. Restart Claude Code

### API Connection Failed

**Problem:** MCP tools return "API call failed" errors.

**Solution:**
1. Verify your Next.js dev server is running: `npm run dev`
2. Check it's on port 3000: `http://localhost:3000`
3. Test the API manually: `http://localhost:3000/api/kanban/board`

### Board Not Initialized

**Problem:** Tools return "Board not initialized" error.

**Solution:**
Visit `http://localhost:3000/api/kanban/board` in your browser to initialize the board.

### Task Not Found

**Problem:** Trying to update/delete a task but getting "Task not found".

**Solution:**
1. Use `list_tasks` to see all task IDs
2. Copy the correct task ID from the list
3. Use that exact ID in your command

## How It Works

```
┌─────────────────┐
│  Claude Code    │
│                 │
│  "Add a task"   │
└────────┬────────┘
         │
         │ MCP Protocol
         ▼
┌─────────────────┐
│  MCP Server     │
│  (mcp-server.js)│
└────────┬────────┘
         │
         │ HTTP API Call
         ▼
┌─────────────────┐
│  Next.js API    │
│  /api/kanban/*  │
└────────┬────────┘
         │
         │ Read/Write
         ▼
┌─────────────────┐
│  data/board.json│
│  (File Storage) │
└─────────────────┘
```

## Architecture Notes

- **Storage**: Tasks are stored in `data/board.json` (file-based)
- **API**: Next.js API routes handle CRUD operations
- **MCP Server**: Translates natural language to API calls
- **Real-time**: Changes are persisted immediately

## Future Enhancements

Possible improvements:
- [ ] Add database support (PostgreSQL, Vercel KV)
- [ ] Real-time sync between MCP and browser
- [ ] Bulk operations (move all tasks, etc.)
- [ ] Search and filter tasks
- [ ] Export/import board data

## Need Help?

If you encounter issues:
1. Check the troubleshooting section above
2. Verify your Next.js dev server is running
3. Check the browser console for errors
4. Look at the MCP server logs

---

**Happy task management! 🚀**
