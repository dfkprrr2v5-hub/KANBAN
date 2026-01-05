#!/usr/bin/env node

/**
 * MCP Server for Tactical Ops Kanban - Multi-Project Support
 *
 * This server provides tools to interact with the Kanban board
 * through Claude Code via the Model Context Protocol.
 *
 * Updated to support multiple projects. Each project has its own independent board.
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

// Cache for default project ID (refreshed on each call to list_projects)
let cachedDefaultProjectId = null;

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

// Helper to get default project ID
async function getDefaultProjectId() {
  if (!cachedDefaultProjectId) {
    const projectsData = await apiCall('/projects');
    cachedDefaultProjectId = projectsData.defaultProjectId;
  }
  return cachedDefaultProjectId;
}

// Helper to build endpoint with projectId query param
function buildEndpoint(path, projectId) {
  if (projectId) {
    return `${path}?projectId=${encodeURIComponent(projectId)}`;
  }
  return path;
}

// Create the MCP server
const server = new Server(
  {
    name: 'tactical-ops-kanban',
    version: '2.0.0',
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
      // ==================== PROJECT MANAGEMENT ====================
      {
        name: 'list_projects',
        description: 'List all available projects and see which is the default/current project',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'create_project',
        description: 'Create a new project with its own independent Kanban board',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Project name (required, max 50 characters)',
            },
            description: {
              type: 'string',
              description: 'Project description (optional, max 200 characters)',
            },
          },
          required: ['name'],
        },
      },
      {
        name: 'delete_project',
        description: 'Delete a project and its board (WARNING: cannot be undone, cannot delete last project)',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: {
              type: 'string',
              description: 'Project ID to delete',
            },
          },
          required: ['projectId'],
        },
      },

      // ==================== TASK MANAGEMENT ====================
      {
        name: 'list_tasks',
        description: 'Get all tasks from a Kanban board (defaults to current project if projectId not specified)',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: {
              type: 'string',
              description: 'Project ID (optional, uses default project if not specified)',
            },
          },
        },
      },
      {
        name: 'add_task',
        description: 'Create a new task in a Kanban board (defaults to current project if projectId not specified)',
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
            projectId: {
              type: 'string',
              description: 'Project ID (optional, uses default project if not specified)',
            },
          },
          required: ['title', 'columnName'],
        },
      },
      {
        name: 'update_task',
        description: 'Update an existing task (defaults to current project if projectId not specified)',
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
            projectId: {
              type: 'string',
              description: 'Project ID (optional, uses default project if not specified)',
            },
          },
          required: ['taskId'],
        },
      },
      {
        name: 'delete_task',
        description: 'Delete a task from the board (defaults to current project if projectId not specified)',
        inputSchema: {
          type: 'object',
          properties: {
            taskId: {
              type: 'string',
              description: 'Task ID to delete',
            },
            projectId: {
              type: 'string',
              description: 'Project ID (optional, uses default project if not specified)',
            },
          },
          required: ['taskId'],
        },
      },

      // ==================== COLUMN MANAGEMENT ====================
      {
        name: 'list_columns',
        description: 'Get all columns in a board (defaults to current project if projectId not specified)',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: {
              type: 'string',
              description: 'Project ID (optional, uses default project if not specified)',
            },
          },
        },
      },
      {
        name: 'add_column',
        description: 'Create a new column in a board (defaults to current project if projectId not specified)',
        inputSchema: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'Column title',
            },
            projectId: {
              type: 'string',
              description: 'Project ID (optional, uses default project if not specified)',
            },
          },
          required: ['title'],
        },
      },
      {
        name: 'rename_column',
        description: 'Rename an existing column (defaults to current project if projectId not specified)',
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
            projectId: {
              type: 'string',
              description: 'Project ID (optional, uses default project if not specified)',
            },
          },
          required: ['columnId', 'newTitle'],
        },
      },
      {
        name: 'delete_column',
        description: 'Delete a column and all its tasks (WARNING: cannot be undone, defaults to current project if projectId not specified)',
        inputSchema: {
          type: 'object',
          properties: {
            columnId: {
              type: 'string',
              description: 'Column ID to delete',
            },
            projectId: {
              type: 'string',
              description: 'Project ID (optional, uses default project if not specified)',
            },
          },
          required: ['columnId'],
        },
      },

      // ==================== BOARD SUMMARY ====================
      {
        name: 'get_board_summary',
        description: 'Get a summary of a board state (defaults to current project if projectId not specified)',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: {
              type: 'string',
              description: 'Project ID (optional, uses default project if not specified)',
            },
          },
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
      // ==================== PROJECT MANAGEMENT ====================
      case 'list_projects': {
        const projectsData = await apiCall('/projects');
        cachedDefaultProjectId = projectsData.defaultProjectId; // Update cache

        const projectList = projectsData.projects
          .map((proj) => {
            const isDefault = proj.id === projectsData.defaultProjectId ? ' ⭐ DEFAULT' : '';
            const desc = proj.description ? `\n    Description: ${proj.description}` : '';
            return `- [${proj.id}] ${proj.name}${isDefault}${desc}`;
          })
          .join('\n\n');

        return {
          content: [
            {
              type: 'text',
              text: `📁 **Projects (${projectsData.projects.length}):**\n\n${projectList}\n\n⭐ = Default project (used when projectId not specified)`,
            },
          ],
        };
      }

      case 'create_project': {
        const newProject = await apiCall('/projects', 'POST', {
          name: args.name,
          description: args.description,
        });

        return {
          content: [
            {
              type: 'text',
              text: `✅ **Project created successfully!**\n\nID: ${newProject.id}\nName: ${newProject.name}\nDescription: ${newProject.description || 'None'}\n\nA new empty board has been created for this project.`,
            },
          ],
        };
      }

      case 'delete_project': {
        await apiCall(`/projects/${args.projectId}`, 'DELETE');
        cachedDefaultProjectId = null; // Clear cache

        return {
          content: [
            {
              type: 'text',
              text: `🗑️ **Project deleted successfully!**\n\nProject ID: ${args.projectId}\n⚠️ The project's board and all its tasks were also deleted.`,
            },
          ],
        };
      }

      // ==================== TASK MANAGEMENT ====================
      case 'list_tasks': {
        const endpoint = buildEndpoint('/tasks', args.projectId);
        const { cards } = await apiCall(endpoint);

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
        const endpoint = buildEndpoint('/tasks', args.projectId);
        const { card } = await apiCall(endpoint, 'POST', {
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

        const endpoint = buildEndpoint(`/tasks/${args.taskId}`, args.projectId);
        const { card } = await apiCall(endpoint, 'PUT', updateData);

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
        const endpoint = buildEndpoint(`/tasks/${args.taskId}`, args.projectId);
        await apiCall(endpoint, 'DELETE');

        return {
          content: [
            {
              type: 'text',
              text: `🗑️ **Task deleted successfully!**\n\nTask ID: ${args.taskId}`,
            },
          ],
        };
      }

      // ==================== COLUMN MANAGEMENT ====================
      case 'list_columns': {
        const endpoint = buildEndpoint('/columns', args.projectId);
        const { columns } = await apiCall(endpoint);

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
        const endpoint = buildEndpoint('/columns', args.projectId);
        const { column } = await apiCall(endpoint, 'POST', {
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
        const endpoint = buildEndpoint(`/columns/${args.columnId}`, args.projectId);
        const { column } = await apiCall(endpoint, 'PUT', {
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
        const endpoint = buildEndpoint(`/columns/${args.columnId}`, args.projectId);
        await apiCall(endpoint, 'DELETE');

        return {
          content: [
            {
              type: 'text',
              text: `🗑️ **Column deleted successfully!**\n\nColumn ID: ${args.columnId}\n⚠️ All tasks in this column were also deleted.`,
            },
          ],
        };
      }

      // ==================== BOARD SUMMARY ====================
      case 'get_board_summary': {
        const endpoint = buildEndpoint('/board', args.projectId);
        const { board } = await apiCall(endpoint);

        const totalTasks = Object.keys(board.cards).length;
        const columnSummary = board.columns
          .map((col) => `  - ${col.title}: ${col.cardIds.length} tasks`)
          .join('\n');

        return {
          content: [
            {
              type: 'text',
              text: `📊 **Board Summary: ${board.title}**\n\nProject ID: ${board.projectId}\nTotal Tasks: ${totalTasks}\n\nColumns:\n${columnSummary}`,
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
  console.error('Tactical Ops Kanban MCP Server v2.0 (Multi-Project) running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
