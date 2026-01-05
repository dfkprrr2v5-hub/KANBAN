import { Column } from './column';
import { Card } from './card';

export interface Board {
  id: string;
  projectId: string;
  title: string;
  columns: Column[];
  cards: Record<string, Card>;
  createdAt: string;
  updatedAt: string;
}

export type DragType = 'card' | 'column';

export interface DragData {
  type: DragType;
  id: string;
  sourceColumnId?: string;
  position?: number;
}
