'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Filter } from 'lucide-react';
import { useSearchStore, PriorityFilter } from '@/lib/store/searchStore';
import { useBoardStore } from '@/lib/store/boardStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';

const PRIORITY_OPTIONS: { value: PriorityFilter; label: string }[] = [
  { value: 'all', label: 'All Priorities' },
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

export const SearchBar = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    searchQuery,
    priorityFilter,
    columnFilter,
    isSearchOpen,
    setSearchQuery,
    setPriorityFilter,
    setColumnFilter,
    closeSearch,
    resetFilters,
  } = useSearchStore();

  const columns = useBoardStore((state) => state.board.columns);
  const cards = useBoardStore((state) => state.board.cards);

  // Focus input when search opens
  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Count matching cards
  const matchCount = Object.values(cards).filter((card) => {
    if (columnFilter !== 'all' && card.columnId !== columnFilter) return false;
    if (priorityFilter !== 'all' && card.priority !== priorityFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const titleMatch = card.title.toLowerCase().includes(query);
      const descMatch = card.description?.toLowerCase().includes(query);
      if (!titleMatch && !descMatch) return false;
    }
    return true;
  }).length;

  const totalCards = Object.keys(cards).length;
  const hasActiveFilters =
    searchQuery !== '' || priorityFilter !== 'all' || columnFilter !== 'all';

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="fixed top-0 left-0 right-0 z-50 bg-background-secondary/95 backdrop-blur-sm border-b-2 border-border-primary shadow-lg"
        >
          <div className="max-w-6xl mx-auto p-4">
            {/* Search Input Row */}
            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Search missions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10 py-3 text-base"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <Button variant="ghost" onClick={closeSearch} size="sm">
                <X className="w-4 h-4 mr-1" />
                Close
              </Button>
            </div>

            {/* Filters Row */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-text-muted" />
                <span className="text-text-muted text-sm font-mono">Filters:</span>
              </div>

              {/* Priority Filter */}
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as PriorityFilter)}
                className={cn(
                  'px-3 py-1.5 font-mono text-sm rounded-md',
                  'bg-background-tertiary text-text-primary',
                  'border-2 border-border-primary',
                  'focus:outline-none focus:border-accent-primary',
                  'cursor-pointer',
                  priorityFilter !== 'all' && 'border-accent-primary'
                )}
              >
                {PRIORITY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {/* Column Filter */}
              <select
                value={columnFilter}
                onChange={(e) => setColumnFilter(e.target.value)}
                className={cn(
                  'px-3 py-1.5 font-mono text-sm rounded-md',
                  'bg-background-tertiary text-text-primary',
                  'border-2 border-border-primary',
                  'focus:outline-none focus:border-accent-primary',
                  'cursor-pointer',
                  columnFilter !== 'all' && 'border-accent-primary'
                )}
              >
                <option value="all">All Sectors</option>
                {columns.map((column) => (
                  <option key={column.id} value={column.id}>
                    {column.title}
                  </option>
                ))}
              </select>

              {/* Reset Filters */}
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  Reset
                </Button>
              )}

              {/* Results Count */}
              <div className="ml-auto text-text-muted text-sm font-mono">
                <span className="text-accent-primary font-bold">{matchCount}</span>
                {' / '}
                {totalCards} missions
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
