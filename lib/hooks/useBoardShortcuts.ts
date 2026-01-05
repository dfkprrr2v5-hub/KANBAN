'use client';

import { useMemo } from 'react';
import { useKeyboardShortcuts, KeyboardShortcut } from './useKeyboardShortcuts';
import { useSearchStore } from '@/lib/store/searchStore';
import { useBoardStore } from '@/lib/store/boardStore';
import { useUIStore } from '@/lib/store/uiStore';
import { useAIStore } from '@/lib/store/aiStore';

interface UseBoardShortcutsOptions {
  onUndo?: () => void;
  onRedo?: () => void;
}

export function useBoardShortcuts(options: UseBoardShortcutsOptions = {}) {
  const { onUndo, onRedo } = options;

  // Search store actions
  const { openSearch, closeSearch, isSearchOpen, toggleSearch } = useSearchStore();

  // Board store actions
  const addColumn = useBoardStore((state) => state.addColumn);
  const resetBoard = useBoardStore((state) => state.resetBoard);
  const columns = useBoardStore((state) => state.board.columns);

  // UI store actions
  const { isCardModalOpen, closeCardModal } = useUIStore();

  // AI store actions
  const { toggleChat: toggleAIChat, isOpen: isAIChatOpen, closeChat: closeAIChat } = useAIStore();

  const shortcuts: KeyboardShortcut[] = useMemo(
    () => [
      // AI Command Center
      {
        key: ' ', // Space
        ctrl: true,
        description: 'Open AI Command Center',
        action: () => toggleAIChat(),
      },

      // Search
      {
        key: 'k',
        ctrl: true,
        description: 'Open search',
        action: () => toggleSearch(),
      },
      {
        key: 'f',
        ctrl: true,
        description: 'Open search',
        action: () => openSearch(),
      },
      {
        key: 'Escape',
        description: 'Close search/modal/AI chat',
        action: () => {
          if (isAIChatOpen) {
            closeAIChat();
          } else if (isSearchOpen) {
            closeSearch();
          } else if (isCardModalOpen) {
            closeCardModal();
          }
        },
      },

      // Column management
      {
        key: 'n',
        ctrl: true,
        shift: true,
        description: 'Add new column',
        action: () => {
          const title = `New Sector ${columns.length + 1}`;
          addColumn(title);
        },
      },

      // Undo/Redo
      {
        key: 'z',
        ctrl: true,
        description: 'Undo',
        action: () => onUndo?.(),
        enabled: !!onUndo,
      },
      {
        key: 'z',
        ctrl: true,
        shift: true,
        description: 'Redo',
        action: () => onRedo?.(),
        enabled: !!onRedo,
      },
      {
        key: 'y',
        ctrl: true,
        description: 'Redo',
        action: () => onRedo?.(),
        enabled: !!onRedo,
      },

      // Help
      {
        key: '?',
        shift: true,
        description: 'Show keyboard shortcuts',
        action: () => {
          // This will be handled by the ShortcutsModal component
          window.dispatchEvent(new CustomEvent('show-shortcuts'));
        },
      },
    ],
    [
      toggleSearch,
      openSearch,
      closeSearch,
      isSearchOpen,
      isCardModalOpen,
      closeCardModal,
      addColumn,
      columns.length,
      onUndo,
      onRedo,
      toggleAIChat,
      isAIChatOpen,
      closeAIChat,
    ]
  );

  useKeyboardShortcuts({ shortcuts });

  return shortcuts;
}

// Get all available shortcuts for display
export const ALL_SHORTCUTS: Array<{ key: string; description: string }> = [
  { key: '⌘/Ctrl + Space', description: 'AI Command Center' },
  { key: '⌘/Ctrl + K', description: 'Toggle search' },
  { key: '⌘/Ctrl + F', description: 'Open search' },
  { key: 'Escape', description: 'Close search/modal/AI' },
  { key: '⌘/Ctrl + Shift + N', description: 'Add new column' },
  { key: '⌘/Ctrl + Z', description: 'Undo' },
  { key: '⌘/Ctrl + Shift + Z', description: 'Redo' },
  { key: 'Shift + ?', description: 'Show shortcuts help' },
];
