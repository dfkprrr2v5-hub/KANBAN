'use client';

import { Search } from 'lucide-react';
import { useSearchStore } from '@/lib/store/searchStore';
import { Button } from '@/components/ui/Button';

export const SearchButton = () => {
  const { openSearch, isSearchOpen } = useSearchStore();

  if (isSearchOpen) return null;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={openSearch}
      className="flex items-center gap-2"
    >
      <Search className="w-4 h-4" />
      <span className="hidden sm:inline">Search</span>
      <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-background-tertiary rounded border border-border-primary">
        <span className="text-xs">⌘</span>K
      </kbd>
    </Button>
  );
};
