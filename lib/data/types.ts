import { Board, Card, Column } from '@/types';

export interface DataProvider {
  // Board operations
  getBoard(): Promise<Board | null>;
  saveBoard(board: Board): Promise<void>;

  // Card operations
  getCard(cardId: string): Promise<Card | null>;
  saveCard(card: Card): Promise<void>;
  deleteCard(cardId: string): Promise<void>;

  // Column operations
  getColumn(columnId: string): Promise<Column | null>;
  saveColumn(column: Column): Promise<void>;
  deleteColumn(columnId: string): Promise<void>;

  // Batch operations
  saveBatch(board: Board): Promise<void>;

  // History operations (for undo/redo)
  getHistory(): Promise<BoardSnapshot[]>;
  saveSnapshot(snapshot: BoardSnapshot): Promise<void>;
  clearHistory(): Promise<void>;
}

export interface BoardSnapshot {
  id: string;
  board: Board;
  action: string;
  timestamp: string;
}

export interface StorageConfig {
  storageKey: string;
  historyKey: string;
  maxHistorySize: number;
}

export const DEFAULT_STORAGE_CONFIG: StorageConfig = {
  storageKey: 'tactical-ops-board',
  historyKey: 'tactical-ops-history',
  maxHistorySize: 50,
};
