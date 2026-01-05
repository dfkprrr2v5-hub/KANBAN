import { Board, Card, Column } from '@/types';
import { Project, CreateProjectDTO, ProjectsIndex } from '@/types/project';

const API_BASE = '/api/kanban';

class ApiClient {
  // Helper to build URLs with projectId query param
  private buildUrl(path: string, projectId?: string): string {
    const url = `${API_BASE}${path}`;
    if (projectId) {
      return `${url}?projectId=${encodeURIComponent(projectId)}`;
    }
    return url;
  }

  // ==========================================
  // PROJECTS
  // ==========================================

  async getProjects(): Promise<ProjectsIndex> {
    const response = await fetch(`${API_BASE}/projects`);
    if (!response.ok) throw new Error('Failed to fetch projects');
    return response.json();
  }

  async getProject(projectId: string): Promise<Project> {
    const response = await fetch(`${API_BASE}/projects/${projectId}`);
    if (!response.ok) throw new Error('Failed to fetch project');
    return response.json();
  }

  async createProject(data: CreateProjectDTO): Promise<Project> {
    const response = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create project');
    return response.json();
  }

  async updateProject(projectId: string, updates: Partial<Omit<Project, 'id' | 'createdAt'>>): Promise<Project> {
    const response = await fetch(`${API_BASE}/projects/${projectId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update project');
    return response.json();
  }

  async deleteProject(projectId: string): Promise<void> {
    const response = await fetch(`${API_BASE}/projects/${projectId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete project');
    }
  }

  // ==========================================
  // BOARD
  // ==========================================

  async getBoard(projectId?: string): Promise<Board> {
    const response = await fetch(this.buildUrl('/board', projectId));
    if (!response.ok) throw new Error('Failed to fetch board');
    const data = await response.json();
    return data.board;
  }

  // ==========================================
  // TASKS/CARDS
  // ==========================================

  async getTasks(projectId?: string): Promise<Card[]> {
    const response = await fetch(this.buildUrl('/tasks', projectId));
    if (!response.ok) throw new Error('Failed to fetch tasks');
    const data = await response.json();
    return data.cards;
  }

  async createTask(
    payload: {
      title: string;
      description?: string;
      columnId?: string;
      columnName?: string;
      priority?: 'low' | 'medium' | 'high' | 'critical';
    },
    projectId?: string
  ): Promise<Card> {
    const response = await fetch(this.buildUrl('/tasks', projectId), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Failed to create task');
    const data = await response.json();
    return data.card;
  }

  async updateTask(
    taskId: string,
    updates: {
      title?: string;
      description?: string;
      priority?: 'low' | 'medium' | 'high' | 'critical';
      columnId?: string;
    },
    projectId?: string
  ): Promise<Card> {
    const response = await fetch(this.buildUrl(`/tasks/${taskId}`, projectId), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update task');
    const data = await response.json();
    return data.card;
  }

  async deleteTask(taskId: string, projectId?: string): Promise<void> {
    const response = await fetch(this.buildUrl(`/tasks/${taskId}`, projectId), {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete task');
  }

  // ==========================================
  // COLUMNS
  // ==========================================

  async getColumns(projectId?: string): Promise<Column[]> {
    const response = await fetch(this.buildUrl('/columns', projectId));
    if (!response.ok) throw new Error('Failed to fetch columns');
    const data = await response.json();
    return data.columns;
  }

  async createColumn(title: string, projectId?: string): Promise<Column> {
    const response = await fetch(this.buildUrl('/columns', projectId), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    if (!response.ok) throw new Error('Failed to create column');
    const data = await response.json();
    return data.column;
  }

  async updateColumn(columnId: string, title: string, projectId?: string): Promise<Column> {
    const response = await fetch(this.buildUrl(`/columns/${columnId}`, projectId), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    if (!response.ok) throw new Error('Failed to update column');
    const data = await response.json();
    return data.column;
  }

  async deleteColumn(columnId: string, projectId?: string): Promise<void> {
    const response = await fetch(this.buildUrl(`/columns/${columnId}`, projectId), {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete column');
  }
}

export const apiClient = new ApiClient();
