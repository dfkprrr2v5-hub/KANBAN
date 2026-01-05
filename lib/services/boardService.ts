import { Board, Card, Column } from '@/types';
import { DataProvider, BoardSnapshot } from '@/lib/data/types';
import { getLocalStorageProvider } from '@/lib/data/localStorageProvider';
import { generateId } from '@/lib/utils/id-generator';

class BoardService {
  private provider: DataProvider;
  private listeners: Set<() => void> = new Set();

  constructor(provider?: DataProvider) {
    this.provider = provider || getLocalStorageProvider();
  }

  // Subscribe to changes
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener());
  }

  // Board operations
  async getBoard(): Promise<Board | null> {
    return this.provider.getBoard();
  }

  async saveBoard(board: Board, action?: string): Promise<void> {
    if (action) {
      await this.createSnapshot(board, action);
    }
    await this.provider.saveBoard({
      ...board,
      updatedAt: new Date().toISOString(),
    });
    this.notifyListeners();
  }

  // Card operations
  async addCard(
    board: Board,
    columnId: string,
    title: string,
    description: string = '',
    priority: Card['priority'] = 'medium'
  ): Promise<Board> {
    const cardId = generateId('card');
    const now = new Date().toISOString();
    const column = board.columns.find((c) => c.id === columnId);

    if (!column) throw new Error(`Column ${columnId} not found`);

    const newCard: Card = {
      id: cardId,
      title,
      description,
      columnId,
      position: column.cardIds.length,
      createdAt: now,
      updatedAt: now,
      priority,
    };

    const updatedBoard: Board = {
      ...board,
      cards: { ...board.cards, [cardId]: newCard },
      columns: board.columns.map((col) =>
        col.id === columnId
          ? { ...col, cardIds: [...col.cardIds, cardId] }
          : col
      ),
      updatedAt: now,
    };

    await this.saveBoard(updatedBoard, `Added card: ${title}`);
    return updatedBoard;
  }

  async updateCard(
    board: Board,
    cardId: string,
    updates: Partial<Card>
  ): Promise<Board> {
    const card = board.cards[cardId];
    if (!card) throw new Error(`Card ${cardId} not found`);

    const updatedCard: Card = {
      ...card,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const updatedBoard: Board = {
      ...board,
      cards: { ...board.cards, [cardId]: updatedCard },
      updatedAt: new Date().toISOString(),
    };

    await this.saveBoard(updatedBoard, `Updated card: ${updatedCard.title}`);
    return updatedBoard;
  }

  async deleteCard(board: Board, cardId: string): Promise<Board> {
    const card = board.cards[cardId];
    if (!card) throw new Error(`Card ${cardId} not found`);

    const { [cardId]: _, ...remainingCards } = board.cards;

    const updatedBoard: Board = {
      ...board,
      cards: remainingCards,
      columns: board.columns.map((col) =>
        col.id === card.columnId
          ? { ...col, cardIds: col.cardIds.filter((id) => id !== cardId) }
          : col
      ),
      updatedAt: new Date().toISOString(),
    };

    await this.saveBoard(updatedBoard, `Deleted card: ${card.title}`);
    return updatedBoard;
  }

  async moveCard(
    board: Board,
    cardId: string,
    targetColumnId: string,
    newPosition: number
  ): Promise<Board> {
    const card = board.cards[cardId];
    if (!card) throw new Error(`Card ${cardId} not found`);

    const sourceColumnId = card.columnId;

    const updatedCard: Card = {
      ...card,
      columnId: targetColumnId,
      position: newPosition,
      updatedAt: new Date().toISOString(),
    };

    const updatedBoard: Board = {
      ...board,
      cards: { ...board.cards, [cardId]: updatedCard },
      columns: board.columns.map((col) => {
        if (col.id === sourceColumnId && col.id !== targetColumnId) {
          return {
            ...col,
            cardIds: col.cardIds.filter((id) => id !== cardId),
          };
        }
        if (col.id === targetColumnId) {
          const newCardIds = col.cardIds.filter((id) => id !== cardId);
          newCardIds.splice(newPosition, 0, cardId);
          return { ...col, cardIds: newCardIds };
        }
        return col;
      }),
      updatedAt: new Date().toISOString(),
    };

    const action =
      sourceColumnId !== targetColumnId
        ? `Moved card: ${card.title}`
        : `Reordered card: ${card.title}`;
    await this.saveBoard(updatedBoard, action);
    return updatedBoard;
  }

  // Column operations
  async addColumn(board: Board, title: string): Promise<Board> {
    const columnId = generateId('col');
    const now = new Date().toISOString();

    const newColumn: Column = {
      id: columnId,
      title,
      position: board.columns.length,
      cardIds: [],
      createdAt: now,
    };

    const updatedBoard: Board = {
      ...board,
      columns: [...board.columns, newColumn],
      updatedAt: now,
    };

    await this.saveBoard(updatedBoard, `Added column: ${title}`);
    return updatedBoard;
  }

  async updateColumn(
    board: Board,
    columnId: string,
    updates: Partial<Column>
  ): Promise<Board> {
    const column = board.columns.find((c) => c.id === columnId);
    if (!column) throw new Error(`Column ${columnId} not found`);

    const updatedBoard: Board = {
      ...board,
      columns: board.columns.map((col) =>
        col.id === columnId ? { ...col, ...updates } : col
      ),
      updatedAt: new Date().toISOString(),
    };

    await this.saveBoard(updatedBoard, `Updated column: ${updates.title || column.title}`);
    return updatedBoard;
  }

  async deleteColumn(board: Board, columnId: string): Promise<Board> {
    const column = board.columns.find((c) => c.id === columnId);
    if (!column) throw new Error(`Column ${columnId} not found`);

    const cardIdsToDelete = column.cardIds;
    const remainingCards = { ...board.cards };
    cardIdsToDelete.forEach((cardId) => {
      delete remainingCards[cardId];
    });

    const updatedBoard: Board = {
      ...board,
      columns: board.columns.filter((c) => c.id !== columnId),
      cards: remainingCards,
      updatedAt: new Date().toISOString(),
    };

    await this.saveBoard(updatedBoard, `Deleted column: ${column.title}`);
    return updatedBoard;
  }

  async moveColumn(
    board: Board,
    columnId: string,
    newPosition: number
  ): Promise<Board> {
    const columns = [...board.columns];
    const currentIndex = columns.findIndex((c) => c.id === columnId);
    if (currentIndex === -1) throw new Error(`Column ${columnId} not found`);

    const [movedColumn] = columns.splice(currentIndex, 1);
    columns.splice(newPosition, 0, movedColumn);

    const updatedColumns = columns.map((col, index) => ({
      ...col,
      position: index,
    }));

    const updatedBoard: Board = {
      ...board,
      columns: updatedColumns,
      updatedAt: new Date().toISOString(),
    };

    await this.saveBoard(updatedBoard, `Moved column: ${movedColumn.title}`);
    return updatedBoard;
  }

  // History/Snapshot operations
  async createSnapshot(board: Board, action: string): Promise<void> {
    const snapshot: BoardSnapshot = {
      id: generateId('snapshot'),
      board: JSON.parse(JSON.stringify(board)), // Deep clone
      action,
      timestamp: new Date().toISOString(),
    };
    await this.provider.saveSnapshot(snapshot);
  }

  async getHistory(): Promise<BoardSnapshot[]> {
    return this.provider.getHistory();
  }

  async clearHistory(): Promise<void> {
    await this.provider.clearHistory();
  }
}

// Singleton instance
let serviceInstance: BoardService | null = null;

export function getBoardService(): BoardService {
  if (!serviceInstance) {
    serviceInstance = new BoardService();
  }
  return serviceInstance;
}

export { BoardService };
