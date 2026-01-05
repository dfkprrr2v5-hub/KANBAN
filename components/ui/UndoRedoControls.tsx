'use client';

import { Undo2, Redo2 } from 'lucide-react';
import { useHistoryStore } from '@/lib/store/historyStore';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';

interface UndoRedoControlsProps {
  onUndo: () => void;
  onRedo: () => void;
  className?: string;
}

export const UndoRedoControls = ({
  onUndo,
  onRedo,
  className,
}: UndoRedoControlsProps) => {
  const canUndo = useHistoryStore((state) => state.canUndo());
  const canRedo = useHistoryStore((state) => state.canRedo());
  const lastAction = useHistoryStore((state) => state.getLastAction());

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={onUndo}
        disabled={!canUndo}
        title={lastAction ? `Undo: ${lastAction}` : 'Nothing to undo'}
        className="flex items-center gap-1"
      >
        <Undo2 className="w-4 h-4" />
        <span className="hidden sm:inline">Undo</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onRedo}
        disabled={!canRedo}
        title="Redo"
        className="flex items-center gap-1"
      >
        <Redo2 className="w-4 h-4" />
        <span className="hidden sm:inline">Redo</span>
      </Button>
    </div>
  );
};
