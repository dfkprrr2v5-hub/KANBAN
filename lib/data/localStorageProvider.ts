import { Board, Card, Column } from '@/types';
import {
  DataProvider,
  BoardSnapshot,
  StorageConfig,
  DEFAULT_STORAGE_CONFIG,
} from './types';
import { generateId } from '@/lib/utils/id-generator';

export class LocalStorageProvider implements DataProvider {
  private config: StorageConfig;

  constructor(config: Partial<StorageConfig> = {}) {
    this.config = { ...DEFAULT_STORAGE_CONFIG, ...config };
  }

  private isClient(): boolean {
    return typeof window !== 'undefined';
  }

  private getStorage<T>(key: string): T | null {
    if (!this.isClient()) return null;
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Error reading from localStorage: ${key}`, error);
      return null;
    }
  }

  private setStorage<T>(key: string, data: T): void {
    if (!this.isClient()) return;
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error writing to localStorage: ${key}`, error);
    }
  }

  async getBoard(): Promise<Board | null> {
    const stored = this.getStorage<{ state: { board: Board } }>(
      this.config.storageKey
    );
    return stored?.state?.board || null;
  }

  async saveBoard(board: Board): Promise<void> {
    const stored = this.getStorage<{ state: { board: Board } }>(
      this.config.storageKey
    ) || { state: { board } };
    stored.state.board = board;
    this.setStorage(this.config.storageKey, stored);
  }

  async getCard(cardId: string): Promise<Card | null> {
    const board = await this.getBoard();
    return board?.cards[cardId] || null;
  }

  async saveCard(card: Card): Promise<void> {
    const board = await this.getBoard();
    if (!board) return;
    board.cards[card.id] = card;
    await this.saveBoard(board);
  }

  async deleteCard(cardId: string): Promise<void> {
    const board = await this.getBoard();
    if (!board) return;
    delete board.cards[cardId];
    board.columns = board.columns.map((col) => ({
      ...col,
      cardIds: col.cardIds.filter((id) => id !== cardId),
    }));
    await this.saveBoard(board);
  }

  async getColumn(columnId: string): Promise<Column | null> {
    const board = await this.getBoard();
    return board?.columns.find((c) => c.id === columnId) || null;
  }

  async saveColumn(column: Column): Promise<void> {
    const board = await this.getBoard();
    if (!board) return;
    const index = board.columns.findIndex((c) => c.id === column.id);
    if (index !== -1) {
      board.columns[index] = column;
    } else {
      board.columns.push(column);
    }
    await this.saveBoard(board);
  }

  async deleteColumn(columnId: string): Promise<void> {
    const board = await this.getBoard();
    if (!board) return;
    const column = board.columns.find((c) => c.id === columnId);
    if (column) {
      column.cardIds.forEach((cardId) => {
        delete board.cards[cardId];
      });
    }
    board.columns = board.columns.filter((c) => c.id !== columnId);
    await this.saveBoard(board);
  }

  async saveBatch(board: Board): Promise<void> {
    await this.saveBoard(board);
  }

  async getHistory(): Promise<BoardSnapshot[]> {
    return this.getStorage<BoardSnapshot[]>(this.config.historyKey) || [];
  }

  async saveSnapshot(snapshot: BoardSnapshot): Promise<void> {
    const history = await this.getHistory();
    history.push(snapshot);

    // Limit history size
    if (history.length > this.config.maxHistorySize) {
      history.shift();
    }

    this.setStorage(this.config.historyKey, history);
  }

  async clearHistory(): Promise<void> {
    this.setStorage(this.config.historyKey, []);
  }
}

// Singleton instance
let providerInstance: LocalStorageProvider | null = null;

export function getLocalStorageProvider(): LocalStorageProvider {
  if (!providerInstance) {
    providerInstance = new LocalStorageProvider();
  }
  return providerInstance;
}
