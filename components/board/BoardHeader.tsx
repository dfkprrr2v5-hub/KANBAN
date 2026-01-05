'use client';

import { useState, useRef, useEffect } from 'react';
import { Keyboard, Sparkles, Menu } from 'lucide-react';
import { SearchButton } from '@/components/search/SearchButton';
import { UndoRedoControls } from '@/components/ui/UndoRedoControls';
import { Button } from '@/components/ui/Button';
import { useBoardStore } from '@/lib/store/boardStore';
import { useProjectStore } from '@/lib/store/projectStore';
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

  const currentProjectId = useProjectStore((state) => state.currentProjectId);
  const currentProject = useProjectStore((state) =>
    state.projects.find((p) => p.id === currentProjectId)
  );
  const updateProject = useProjectStore((state) => state.updateProject);

  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const showShortcuts = () => {
    window.dispatchEvent(new CustomEvent('show-shortcuts'));
  };

  const handleDoubleClick = () => {
    if (!currentProject) return;
    setEditedName(currentProject.name);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!currentProject || !editedName.trim() || editedName.trim() === currentProject.name) {
      setIsEditing(false);
      return;
    }

    try {
      await updateProject(currentProject.id, { name: editedName.trim() });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update project name:', error);
      alert('Failed to update project name');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
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

        {/* Editable Project Title */}
        {isEditing ? (
          <div className="flex items-center gap-2">
            <span className="text-2xl font-mono font-bold text-accent-primary">▢</span>
            <input
              ref={inputRef}
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSave}
              maxLength={50}
              className={cn(
                'text-2xl font-mono font-bold text-accent-primary tracking-wider',
                'bg-background-secondary border-2 border-accent-primary rounded px-2 py-1',
                'focus:outline-none focus:ring-2 focus:ring-accent-primary/50'
              )}
              style={{ minWidth: '200px', maxWidth: '400px' }}
            />
          </div>
        ) : (
          <h1
            className="text-2xl font-mono font-bold text-accent-primary tracking-wider cursor-pointer hover:opacity-80 transition-opacity"
            onDoubleClick={handleDoubleClick}
            title="Double-click to rename project"
          >
            ▢ {currentProject?.name || boardTitle}
          </h1>
        )}

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
