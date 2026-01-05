'use client';

import { create } from 'zustand';
import { Card } from '@/types';

export type PriorityFilter = 'all' | 'low' | 'medium' | 'high' | 'critical';
export type ColumnFilter = 'all' | string;

interface SearchState {
  searchQuery: string;
  priorityFilter: PriorityFilter;
  columnFilter: ColumnFilter;
  isSearchOpen: boolean;

  // Actions
  setSearchQuery: (query: string) => void;
  setPriorityFilter: (priority: PriorityFilter) => void;
  setColumnFilter: (columnId: ColumnFilter) => void;
  toggleSearch: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  resetFilters: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  searchQuery: '',
  priorityFilter: 'all',
  columnFilter: 'all',
  isSearchOpen: false,

  setSearchQuery: (query) => set({ searchQuery: query }),
  setPriorityFilter: (priority) => set({ priorityFilter: priority }),
  setColumnFilter: (columnId) => set({ columnFilter: columnId }),
  toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),
  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false, searchQuery: '' }),
  resetFilters: () =>
    set({
      searchQuery: '',
      priorityFilter: 'all',
      columnFilter: 'all',
    }),
}));

// Utility function to filter cards based on search and filters
export function filterCards(
  cards: Record<string, Card>,
  searchQuery: string,
  priorityFilter: PriorityFilter,
  columnFilter: ColumnFilter
): Set<string> {
  const matchingCardIds = new Set<string>();
  const query = searchQuery.toLowerCase().trim();

  Object.values(cards).forEach((card) => {
    // Check column filter
    if (columnFilter !== 'all' && card.columnId !== columnFilter) {
      return;
    }

    // Check priority filter
    if (priorityFilter !== 'all' && card.priority !== priorityFilter) {
      return;
    }

    // Check search query
    if (query) {
      const titleMatch = card.title.toLowerCase().includes(query);
      const descriptionMatch = card.description?.toLowerCase().includes(query);
      const tagsMatch = card.tags?.some((tag) =>
        tag.toLowerCase().includes(query)
      );

      if (!titleMatch && !descriptionMatch && !tagsMatch) {
        return;
      }
    }

    matchingCardIds.add(card.id);
  });

  return matchingCardIds;
}

// Hook to get filtered card IDs
export function useFilteredCards(cards: Record<string, Card>): Set<string> {
  const { searchQuery, priorityFilter, columnFilter } = useSearchStore();
  return filterCards(cards, searchQuery, priorityFilter, columnFilter);
}

// Check if any filters are active
export function useHasActiveFilters(): boolean {
  const { searchQuery, priorityFilter, columnFilter } = useSearchStore();
  return searchQuery !== '' || priorityFilter !== 'all' || columnFilter !== 'all';
}
