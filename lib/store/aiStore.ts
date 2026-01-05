'use client';

import { create } from 'zustand';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface PendingAction {
  type: 'create_task' | 'create_project';
  title: string;
  suggestedDescription: string;
  columnName?: string;
  columnId?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  projectName?: string;
}

interface AIState {
  isOpen: boolean;
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  pendingAction: PendingAction | null;

  // Actions
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearMessages: () => void;
  setPendingAction: (action: PendingAction | null) => void;
}

export const useAIStore = create<AIState>((set) => ({
  isOpen: false,
  messages: [],
  isLoading: false,
  error: null,
  pendingAction: null,

  openChat: () => set({ isOpen: true }),
  closeChat: () => set({ isOpen: false }),
  toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),

  addMessage: (message) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...message,
          id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
        },
      ],
    })),

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearMessages: () => set({ messages: [], pendingAction: null }),
  setPendingAction: (action) => set({ pendingAction: action }),
}));
