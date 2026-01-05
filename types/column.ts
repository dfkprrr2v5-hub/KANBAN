export interface Column {
  id: string;
  title: string;
  position: number;
  cardIds: string[];
  color?: string;
  isCollapsed?: boolean;
  createdAt: string;
}
