'use client';

import { create } from 'zustand';
import { Board, Card, Column } from '@/types';
import { apiClient } from '@/lib/services/apiClient';

interface BoardState {
  board: Board;
  activeCardId: string | null;
  activeColumnId: string | null;
  isLoading: boolean;
  error: string | null;

  // API actions
  loadBoard: () => Promise<void>;
  refreshBoard: () => Promise<void>;

  // Card actions
  addCard: (columnId: string, title: string, description: string) => Promise<void>;
  updateCard: (cardId: string, updates: Partial<Card>) => Promise<void>;
  deleteCard: (cardId: string) => Promise<void>;
  moveCard: (cardId: string, targetColumnId: string, newPosition: number) => void;

  // Column actions
  addColumn: (title: string) => Promise<void>;
  updateColumn: (columnId: string, updates: Partial<Column>) => Promise<void>;
  deleteColumn: (columnId: string) => Promise<void>;
  moveColumn: (columnId: string, newPosition: number) => void;
  toggleColumnCollapse: (columnId: string) => void;

  // Board actions
  updateBoard: (updates: Partial<Board>) => void;
  resetBoard: () => void;

  // UI state
  setActiveCard: (cardId: string | null) => void;
  setActiveColumn: (columnId: string | null) => void;
}

const getDefaultBoard = (): Board => ({
  id: 'default-board',
  title: 'Tactical Operations',
  columns: [],
  cards: {},
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const useBoardStore = create<BoardState>((set, get) => ({
  board: getDefaultBoard(),
  activeCardId: null,
  activeColumnId: null,
  isLoading: false,
  error: null,

  // Load board from API
  loadBoard: async () => {
    set({ isLoading: true, error: null });
    try {
      const board = await apiClient.getBoard();
      set({ board, isLoading: false });
    } catch (error) {
      console.error('Failed to load board:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to load board', isLoading: false });
    }
  },

  // Refresh board from API
  refreshBoard: async () => {
    try {
      const board = await apiClient.getBoard();
      set({ board });
    } catch (error) {
      console.error('Failed to refresh board:', error);
    }
  },

  // Add card via API
  addCard: async (columnId, title, description) => {
    try {
      await apiClient.createTask({
        title,
        description,
        columnId,
        priority: 'medium',
      });
      // Refresh board to get updated state
      await get().refreshBoard();
    } catch (error) {
      console.error('Failed to add card:', error);
      throw error;
    }
  },

  // Update card via API
  updateCard: async (cardId, updates) => {
    try {
      await apiClient.updateTask(cardId, updates);
      // Refresh board to get updated state
      await get().refreshBoard();
    } catch (error) {
      console.error('Failed to update card:', error);
      throw error;
    }
  },

  // Delete card via API
  deleteCard: async (cardId) => {
    try {
      await apiClient.deleteTask(cardId);
      // Refresh board to get updated state
      await get().refreshBoard();
    } catch (error) {
      console.error('Failed to delete card:', error);
      throw error;
    }
  },

  // Move card (local only for now - drag and drop)
  moveCard: (cardId, targetColumnId, newPosition) => {
    set((state) => {
      const card = state.board.cards[cardId];
      if (!card) return state;

      const sourceColumnId = card.columnId;
      if (sourceColumnId === targetColumnId && card.position === newPosition) {
        return state;
      }

      const updatedCard = {
        ...card,
        columnId: targetColumnId,
        position: newPosition,
        updatedAt: new Date().toISOString(),
      };

      return {
        board: {
          ...state.board,
          cards: {
            ...state.board.cards,
            [cardId]: updatedCard,
          },
          columns: state.board.columns.map((col) => {
            if (col.id === sourceColumnId) {
              return {
                ...col,
                cardIds: col.cardIds.filter((id) => id !== cardId),
              };
            }
            if (col.id === targetColumnId) {
              const newCardIds = [...col.cardIds];
              newCardIds.splice(newPosition, 0, cardId);
              return {
                ...col,
                cardIds: newCardIds,
              };
            }
            return col;
          }),
          updatedAt: new Date().toISOString(),
        },
      };
    });

    // Sync with API in background
    apiClient.updateTask(cardId, { columnId: targetColumnId }).catch(console.error);
  },

  // Add column via API
  addColumn: async (title) => {
    console.log('[BoardStore] addColumn called with title:', title);
    try {
      await apiClient.createColumn(title);
      console.log('[BoardStore] Column created via API');
      // Refresh board to get updated state
      await get().refreshBoard();
      console.log('[BoardStore] Board refreshed');
    } catch (error) {
      console.error('Failed to add column:', error);
      throw error;
    }
  },

  // Update column via API
  updateColumn: async (columnId, updates) => {
    try {
      if (updates.title) {
        await apiClient.updateColumn(columnId, updates.title);
        // Refresh board to get updated state
        await get().refreshBoard();
      }
    } catch (error) {
      console.error('Failed to update column:', error);
      throw error;
    }
  },

  // Delete column via API
  deleteColumn: async (columnId) => {
    try {
      await apiClient.deleteColumn(columnId);
      // Refresh board to get updated state
      await get().refreshBoard();
    } catch (error) {
      console.error('Failed to delete column:', error);
      throw error;
    }
  },

  // Move column (local only for now)
  moveColumn: (columnId, newPosition) => {
    set((state) => {
      const columns = [...state.board.columns];
      const currentIndex = columns.findIndex((c) => c.id === columnId);

      if (currentIndex === -1 || currentIndex === newPosition) return state;

      const [movedColumn] = columns.splice(currentIndex, 1);
      columns.splice(newPosition, 0, movedColumn);

      const updatedColumns = columns.map((col, index) => ({
        ...col,
        position: index,
      }));

      return {
        board: {
          ...state.board,
          columns: updatedColumns,
          updatedAt: new Date().toISOString(),
        },
      };
    });
  },

  // Toggle column collapse (local only)
  toggleColumnCollapse: (columnId) => {
    set((state) => {
      const column = state.board.columns.find((c) => c.id === columnId);
      if (!column) return state;

      return {
        board: {
          ...state.board,
          columns: state.board.columns.map((col) =>
            col.id === columnId
              ? { ...col, isCollapsed: !col.isCollapsed }
              : col
          ),
        },
      };
    });
  },

  updateBoard: (updates) => {
    set((state) => ({
      board: {
        ...state.board,
        ...updates,
        updatedAt: new Date().toISOString(),
      },
    }));
  },

  resetBoard: () => {
    set({
      board: getDefaultBoard(),
      activeCardId: null,
      activeColumnId: null,
    });
  },

  setActiveCard: (cardId) => set({ activeCardId: cardId }),
  setActiveColumn: (columnId) => set({ activeColumnId: columnId }),
}));
