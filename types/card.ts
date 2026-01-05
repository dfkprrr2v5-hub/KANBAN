export interface Card {
  id: string;
  title: string;
  description: string;
  columnId: string;
  position: number;
  createdAt: string;
  updatedAt: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  tags?: string[];
}
