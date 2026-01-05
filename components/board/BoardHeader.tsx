'use client';

import { Keyboard, Sparkles, Menu } from 'lucide-react';
import { SearchButton } from '@/components/search/SearchButton';
import { UndoRedoControls } from '@/components/ui/UndoRedoControls';
import { Button } from '@/components/ui/Button';
import { useBoardStore } from '@/lib/store/boardStore';
import { useAIStore } from '@/lib/store/aiStore';
import { useUIStore } from '@/lib/store/uiStore';
import { cn } from '@/lib/utils/cn';

interface BoardHeaderProps {
  onUndo: () => void;
  onRedo: () => void;
}

export const BoardHeader = ({ onUndo, onRedo }: BoardHeaderProps) => {
  const boardTitle = useBoardStore((state) => state.board.title);
  const cardCount = useBoardStore((state) => Object.keys(state.board.cards).length);
  const columnCount = useBoardStore((state) => state.board.columns.length);
  const openAIChat = useAIStore((state) => state.openChat);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);

  const showShortcuts = () => {
    window.dispatchEvent(new CustomEvent('show-shortcuts'));
  };

  return (
    <header
      className={cn(
        'relative z-20 flex items-center justify-between',
        'px-8 py-4 border-b-2 border-border-primary',
        'bg-background-primary/80 backdrop-blur-sm'
      )}
    >
      {/* Left: Projects Button + Title and Stats */}
      <div className="flex items-center gap-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="flex items-center gap-2"
          title="Projects Menu"
        >
          <Menu className="w-4 h-4" />
        </Button>
        <h1 className="text-2xl font-mono font-bold text-accent-primary tracking-wider">
          ▢ {boardTitle}
        </h1>
        <div className="hidden md:flex items-center gap-4 text-text-muted text-sm font-mono">
          <span>
            <span className="text-text-primary font-bold">{columnCount}</span> sectors
          </span>
          <span className="text-border-primary">|</span>
          <span>
            <span className="text-text-primary font-bold">{cardCount}</span> missions
          </span>
        </div>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-4">
        <UndoRedoControls onUndo={onUndo} onRedo={onRedo} />
        <div className="w-px h-6 bg-border-primary" />
        <Button
          variant="primary"
          size="sm"
          onClick={openAIChat}
          className="flex items-center gap-2"
          title="AI Command Center (Ctrl+Space)"
        >
          <Sparkles className="w-4 h-4" />
          <span className="hidden sm:inline">AI</span>
        </Button>
        <SearchButton />
        <Button
          variant="ghost"
          size="sm"
          onClick={showShortcuts}
          className="flex items-center gap-2"
          title="Keyboard shortcuts"
        >
          <Keyboard className="w-4 h-4" />
          <span className="hidden sm:inline">Shortcuts</span>
        </Button>
      </div>
    </header>
  );
};
