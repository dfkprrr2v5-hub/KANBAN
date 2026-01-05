#!/usr/bin/env node

/**
 * MCP Server for Tactical Ops Kanban
 *
 * This server provides tools to interact with the Kanban board
 * through Claude Code via the Model Context Protocol.
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');

// Use environment variable for API base URL, default to localhost
// For network access, set MCP_API_HOST environment variable
const API_HOST = process.env.MCP_API_HOST || 'http://localhost:3000';
const API_BASE = `${API_HOST}/api/kanban`;

// Helper function to make API calls
async function apiCall(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `API call failed: ${response.status}`);
  }

  return data;
}

// Create the MCP server
const server = new Server(
  {
    name: 'tactical-ops-kanban',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List all available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'list_tasks',
        description: 'Get all tasks from the Kanban board',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'add_task',
        description: 'Create a new task in the Kanban board',
        inputSchema: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'Task title (required)',
            },
            description: {
              type: 'string',
              description: 'Task description (optional)',
            },
            columnName: {
              type: 'string',
              description: 'Column name (e.g., "TODO", "In Progress", "Completed")',
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'critical'],
              description: 'Task priority (default: medium)',
            },
          },
          required: ['title', 'columnName'],
        },
      },
      {
        name: 'update_task',
        description: 'Update an existing task',
        inputSchema: {
          type: 'object',
          properties: {
            taskId: {
              type: 'string',
              description: 'Task ID to update',
            },
            title: {
              type: 'string',
              description: 'New task title (optional)',
            },
            description: {
              type: 'string',
              description: 'New task description (optional)',
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'critical'],
              description: 'New priority (optional)',
            },
            columnId: {
              type: 'string',
              description: 'Move to column ID (optional)',
            },
          },
          required: ['taskId'],
        },
      },
      {
        name: 'delete_task',
        description: 'Delete a task from the board',
        inputSchema: {
          type: 'object',
          properties: {
            taskId: {
              type: 'string',
              description: 'Task ID to delete',
            },
          },
          required: ['taskId'],
        },
      },
      {
        name: 'list_columns',
        description: 'Get all columns in the board',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'add_column',
        description: 'Create a new column in the board',
        inputSchema: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'Column title',
            },
          },
          required: ['title'],
        },
      },
      {
        name: 'rename_column',
        description: 'Rename an existing column',
        inputSchema: {
          type: 'object',
          properties: {
            columnId: {
              type: 'string',
              description: 'Column ID to rename',
            },
            newTitle: {
              type: 'string',
              description: 'New column title',
            },
          },
          required: ['columnId', 'newTitle'],
        },
      },
      {
        name: 'delete_column',
        description: 'Delete a column and all its tasks (WARNING: cannot be undone)',
        inputSchema: {
          type: 'object',
          properties: {
            columnId: {
              type: 'string',
              description: 'Column ID to delete',
            },
          },
          required: ['columnId'],
        },
      },
      {
        name: 'get_board_summary',
        description: 'Get a summary of the entire board state',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'list_tasks': {
        const { cards } = await apiCall('/tasks');
        const taskList = cards
          .map(
            (card) =>
              `- [${card.id}] ${card.title} (${card.priority}) - Column: ${card.columnId}`
          )
          .join('\n');

        return {
          content: [
            {
              type: 'text',
              text: `📋 **Found ${cards.length} tasks:**\n\n${taskList || 'No tasks found.'}`,
            },
          ],
        };
      }

      case 'add_task': {
        const { card } = await apiCall('/tasks', 'POST', {
          title: args.title,
          description: args.description || '',
          columnName: args.columnName,
          priority: args.priority || 'medium',
        });

        return {
          content: [
            {
              type: 'text',
              text: `✅ **Task created successfully!**\n\nID: ${card.id}\nTitle: ${card.title}\nColumn: ${card.columnId}\nPriority: ${card.priority}`,
            },
          ],
        };
      }

      case 'update_task': {
        const updateData = {};
        if (args.title) updateData.title = args.title;
        if (args.description !== undefined) updateData.description = args.description;
        if (args.priority) updateData.priority = args.priority;
        if (args.columnId) updateData.columnId = args.columnId;

        const { card } = await apiCall(`/tasks/${args.taskId}`, 'PUT', updateData);

        return {
          content: [
            {
              type: 'text',
              text: `✅ **Task updated successfully!**\n\nID: ${card.id}\nTitle: ${card.title}\nPriority: ${card.priority}`,
            },
          ],
        };
      }

      case 'delete_task': {
        await apiCall(`/tasks/${args.taskId}`, 'DELETE');

        return {
          content: [
            {
              type: 'text',
              text: `🗑️ **Task deleted successfully!**\n\nTask ID: ${args.taskId}`,
            },
          ],
        };
      }

      case 'list_columns': {
        const { columns } = await apiCall('/columns');
        const columnList = columns
          .map((col) => `- [${col.id}] ${col.title} (${col.cardIds.length} tasks)`)
          .join('\n');

        return {
          content: [
            {
              type: 'text',
              text: `📊 **Board Columns:**\n\n${columnList}`,
            },
          ],
        };
      }

      case 'add_column': {
        const { column } = await apiCall('/columns', 'POST', {
          title: args.title,
        });

        return {
          content: [
            {
              type: 'text',
              text: `✅ **Column created successfully!**\n\nID: ${column.id}\nTitle: ${column.title}`,
            },
          ],
        };
      }

      case 'rename_column': {
        const { column } = await apiCall(`/columns/${args.columnId}`, 'PUT', {
          title: args.newTitle,
        });

        return {
          content: [
            {
              type: 'text',
              text: `✅ **Column renamed successfully!**\n\nID: ${column.id}\nNew title: ${column.title}`,
            },
          ],
        };
      }

      case 'delete_column': {
        await apiCall(`/columns/${args.columnId}`, 'DELETE');

        return {
          content: [
            {
              type: 'text',
              text: `🗑️ **Column deleted successfully!**\n\nColumn ID: ${args.columnId}\n⚠️ All tasks in this column were also deleted.`,
            },
          ],
        };
      }

      case 'get_board_summary': {
        const { board } = await apiCall('/board');
        const totalTasks = Object.keys(board.cards).length;
        const columnSummary = board.columns
          .map((col) => `  - ${col.title}: ${col.cardIds.length} tasks`)
          .join('\n');

        return {
          content: [
            {
              type: 'text',
              text: `📊 **Board Summary: ${board.title}**\n\nTotal Tasks: ${totalTasks}\n\nColumns:\n${columnSummary}`,
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `❌ **Error:** ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Tactical Ops Kanban MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
