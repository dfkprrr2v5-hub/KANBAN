'use client';

import { create } from 'zustand';

interface UIState {
  isCardModalOpen: boolean;
  editingCardId: string | null;
  isDragging: boolean;
  dragType: 'card' | 'column' | null;
  isSidebarOpen: boolean;

  openCardModal: (cardId: string) => void;
  closeCardModal: () => void;
  setDragging: (isDragging: boolean, dragType?: 'card' | 'column' | null) => void;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  openSidebar: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isCardModalOpen: false,
  editingCardId: null,
  isDragging: false,
  dragType: null,
  isSidebarOpen: false,

  openCardModal: (cardId) => set({ isCardModalOpen: true, editingCardId: cardId }),
  closeCardModal: () => set({ isCardModalOpen: false, editingCardId: null }),
  setDragging: (isDragging, dragType = null) => set({ isDragging, dragType }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  closeSidebar: () => set({ isSidebarOpen: false }),
  openSidebar: () => set({ isSidebarOpen: true }),
}));
