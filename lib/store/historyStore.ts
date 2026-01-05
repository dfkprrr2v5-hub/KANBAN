'use client';

import { create } from 'zustand';
import { Board } from '@/types';

interface HistoryEntry {
  board: Board;
  action: string;
  timestamp: number;
}

interface HistoryState {
  past: HistoryEntry[];
  future: HistoryEntry[];
  maxHistorySize: number;

  // Actions
  pushState: (board: Board, action: string) => void;
  undo: () => Board | null;
  redo: () => Board | null;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clearHistory: () => void;
  getLastAction: () => string | null;
}

const MAX_HISTORY_SIZE = 50;

export const useHistoryStore = create<HistoryState>((set, get) => ({
  past: [],
  future: [],
  maxHistorySize: MAX_HISTORY_SIZE,

  pushState: (board: Board, action: string) => {
    set((state) => {
      const newEntry: HistoryEntry = {
        board: JSON.parse(JSON.stringify(board)), // Deep clone
        action,
        timestamp: Date.now(),
      };

      let newPast = [...state.past, newEntry];

      // Limit history size
      if (newPast.length > state.maxHistorySize) {
        newPast = newPast.slice(-state.maxHistorySize);
      }

      return {
        past: newPast,
        future: [], // Clear future on new action
      };
    });
  },

  undo: () => {
    const state = get();
    if (state.past.length === 0) return null;

    const newPast = [...state.past];
    const lastEntry = newPast.pop();

    if (!lastEntry) return null;

    set({
      past: newPast,
      future: [lastEntry, ...state.future],
    });

    // Return the board state to restore to (previous state)
    const previousEntry = newPast[newPast.length - 1];
    return previousEntry?.board || null;
  },

  redo: () => {
    const state = get();
    if (state.future.length === 0) return null;

    const newFuture = [...state.future];
    const nextEntry = newFuture.shift();

    if (!nextEntry) return null;

    set({
      past: [...state.past, nextEntry],
      future: newFuture,
    });

    return nextEntry.board;
  },

  canUndo: () => {
    return get().past.length > 1; // Need at least 2 entries (initial + changes)
  },

  canRedo: () => {
    return get().future.length > 0;
  },

  clearHistory: () => {
    set({ past: [], future: [] });
  },

  getLastAction: () => {
    const state = get();
    if (state.past.length === 0) return null;
    return state.past[state.past.length - 1].action;
  },
}));

// Hook to use undo/redo with board store
export function useUndoRedo(
  currentBoard: Board,
  setBoard: (board: Board) => void
) {
  const { pushState, undo, redo, canUndo, canRedo, getLastAction } = useHistoryStore();

  const handleUndo = () => {
    const previousBoard = undo();
    if (previousBoard) {
      setBoard(previousBoard);
    }
  };

  const handleRedo = () => {
    const nextBoard = redo();
    if (nextBoard) {
      setBoard(nextBoard);
    }
  };

  const recordAction = (action: string) => {
    pushState(currentBoard, action);
  };

  return {
    undo: handleUndo,
    redo: handleRedo,
    canUndo: canUndo(),
    canRedo: canRedo(),
    recordAction,
    lastAction: getLastAction(),
  };
}
