'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Board, Card, Column } from '@/types';
import { generateId } from '@/lib/utils/id-generator';

interface BoardState {
  board: Board;
  activeCardId: string | null;
  activeColumnId: string | null;

  // Card actions
  addCard: (columnId: string, title: string, description: string) => void;
  updateCard: (cardId: string, updates: Partial<Card>) => void;
  deleteCard: (cardId: string) => void;
  moveCard: (cardId: string, targetColumnId: string, newPosition: number) => void;

  // Column actions
  addColumn: (title: string) => void;
  updateColumn: (columnId: string, updates: Partial<Column>) => void;
  deleteColumn: (columnId: string) => void;
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
  columns: [
    {
      id: 'col-todo',
      title: 'TODO',
      position: 0,
      cardIds: [],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'col-in-progress',
      title: 'In Progress',
      position: 1,
      cardIds: [],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'col-completed',
      title: 'Completed',
      position: 2,
      cardIds: [],
      createdAt: new Date().toISOString(),
    },
  ],
  cards: {},
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const useBoardStore = create<BoardState>()(
  persist(
    (set, get) => ({
      board: getDefaultBoard(),
      activeCardId: null,
      activeColumnId: null,

      addCard: (columnId, title, description) => {
        set((state) => {
          const cardId = generateId('card');
          const now = new Date().toISOString();
          const column = state.board.columns.find((c) => c.id === columnId);

          if (!column) return state;

          const newCard: Card = {
            id: cardId,
            title,
            description,
            columnId,
            position: column.cardIds.length,
            createdAt: now,
            updatedAt: now,
            priority: 'medium',
          };

          return {
            board: {
              ...state.board,
              cards: {
                ...state.board.cards,
                [cardId]: newCard,
              },
              columns: state.board.columns.map((col) =>
                col.id === columnId
                  ? { ...col, cardIds: [...col.cardIds, cardId] }
                  : col
              ),
              updatedAt: now,
            },
          };
        });
      },

      updateCard: (cardId, updates) => {
        set((state) => {
          const card = state.board.cards[cardId];
          if (!card) return state;

          return {
            board: {
              ...state.board,
              cards: {
                ...state.board.cards,
                [cardId]: {
                  ...card,
                  ...updates,
                  updatedAt: new Date().toISOString(),
                },
              },
              updatedAt: new Date().toISOString(),
            },
          };
        });
      },

      deleteCard: (cardId) => {
        set((state) => {
          const card = state.board.cards[cardId];
          if (!card) return state;

          const { [cardId]: _, ...remainingCards } = state.board.cards;

          return {
            board: {
              ...state.board,
              cards: remainingCards,
              columns: state.board.columns.map((col) =>
                col.id === card.columnId
                  ? {
                      ...col,
                      cardIds: col.cardIds.filter((id) => id !== cardId),
                    }
                  : col
              ),
              updatedAt: new Date().toISOString(),
            },
            activeCardId: null,
          };
        });
      },

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
      },

      addColumn: (title) => {
        console.log('[BoardStore] addColumn called with title:', title);
        set((state) => {
          const columnId = generateId('col');
          const now = new Date().toISOString();
          const position = state.board.columns.length;

          const newColumn: Column = {
            id: columnId,
            title,
            position,
            cardIds: [],
            createdAt: now,
          };

          console.log('[BoardStore] Creating new column:', newColumn);
          console.log('[BoardStore] Previous columns count:', state.board.columns.length);

          return {
            board: {
              ...state.board,
              columns: [...state.board.columns, newColumn],
              updatedAt: now,
            },
          };
        });
        console.log('[BoardStore] Column added, new state should be updated');
      },

      updateColumn: (columnId, updates) => {
        set((state) => {
          const column = state.board.columns.find((c) => c.id === columnId);
          if (!column) return state;

          return {
            board: {
              ...state.board,
              columns: state.board.columns.map((col) =>
                col.id === columnId ? { ...col, ...updates } : col
              ),
              updatedAt: new Date().toISOString(),
            },
          };
        });
      },

      deleteColumn: (columnId) => {
        set((state) => {
          const column = state.board.columns.find((c) => c.id === columnId);
          if (!column) return state;

          const cardIdsToDelete = column.cardIds;
          const { ...remainingCards } = state.board.cards;

          cardIdsToDelete.forEach((cardId) => {
            delete remainingCards[cardId];
          });

          return {
            board: {
              ...state.board,
              columns: state.board.columns.filter((c) => c.id !== columnId),
              cards: remainingCards,
              updatedAt: new Date().toISOString(),
            },
          };
        });
      },

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
    }),
    {
      name: 'tactical-ops-board',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ board: state.board }),
      skipHydration: true,
    }
  )
);
