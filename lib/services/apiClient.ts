import { Board, Card, Column } from '@/types';

const API_BASE = '/api/kanban';

class ApiClient {
  // Board
  async getBoard(): Promise<Board> {
    const response = await fetch(`${API_BASE}/board`);
    if (!response.ok) throw new Error('Failed to fetch board');
    const data = await response.json();
    return data.board;
  }

  // Tasks/Cards
  async getTasks(): Promise<Card[]> {
    const response = await fetch(`${API_BASE}/tasks`);
    if (!response.ok) throw new Error('Failed to fetch tasks');
    const data = await response.json();
    return data.cards;
  }

  async createTask(payload: {
    title: string;
    description?: string;
    columnId?: string;
    columnName?: string;
    priority?: 'low' | 'medium' | 'high' | 'critical';
  }): Promise<Card> {
    const response = await fetch(`${API_BASE}/tasks`, {
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
    }
  ): Promise<Card> {
    const response = await fetch(`${API_BASE}/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update task');
    const data = await response.json();
    return data.card;
  }

  async deleteTask(taskId: string): Promise<void> {
    const response = await fetch(`${API_BASE}/tasks/${taskId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete task');
  }

  // Columns
  async getColumns(): Promise<Column[]> {
    const response = await fetch(`${API_BASE}/columns`);
    if (!response.ok) throw new Error('Failed to fetch columns');
    const data = await response.json();
    return data.columns;
  }

  async createColumn(title: string): Promise<Column> {
    const response = await fetch(`${API_BASE}/columns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    if (!response.ok) throw new Error('Failed to create column');
    const data = await response.json();
    return data.column;
  }

  async updateColumn(columnId: string, title: string): Promise<Column> {
    const response = await fetch(`${API_BASE}/columns/${columnId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    if (!response.ok) throw new Error('Failed to update column');
    const data = await response.json();
    return data.column;
  }

  async deleteColumn(columnId: string): Promise<void> {
    const response = await fetch(`${API_BASE}/columns/${columnId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete column');
  }
}

export const apiClient = new ApiClient();
