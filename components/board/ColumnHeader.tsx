'use client';

import { useState } from 'react';
import { useBoardStore } from '@/lib/store/boardStore';
import { Column } from '@/types';
import { DropdownMenu } from '@/components/ui/DropdownMenu';
import { Input } from '@/components/ui/Input';
import { ChevronDown, ChevronUp, GripHorizontal } from 'lucide-react';

interface ColumnHeaderProps {
  column: Column;
  dragHandleProps: any;
}

export const ColumnHeader = ({ column, dragHandleProps }: ColumnHeaderProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(column.title);
  const { updateColumn, deleteColumn, toggleColumnCollapse, board } = useBoardStore();

  const cardCount = column.cardIds.length;

  const handleSave = () => {
    if (title.trim()) {
      updateColumn(column.id, { title: title.trim() });
    } else {
      setTitle(column.title);
    }
    setIsEditing(false);
  };

  return (
    <div className="flex items-center justify-between p-4 border-b-2 border-border-primary gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <div
            {...dragHandleProps}
            className="text-text-muted hover:text-accent-primary cursor-grab active:cursor-grabbing transition-colors"
          >
            <GripHorizontal size={22} />
          </div>

          {isEditing ? (
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleSave}
              onKeyPress={(e) => e.key === 'Enter' && handleSave()}
              autoFocus
              className="text-sm !py-1"
            />
          ) : (
            <div className="flex-1 cursor-pointer" onDoubleClick={() => setIsEditing(true)}>
              <h2 className="text-text-primary font-bold font-mono text-lg uppercase tracking-wider">
                {column.title}
              </h2>
              <p className="text-text-muted text-sm font-mono mt-1">
                {cardCount} {cardCount === 1 ? 'MISSION' : 'MISSIONS'}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => toggleColumnCollapse(column.id)}
          className="p-1 text-text-muted hover:text-accent-primary hover:bg-background-tertiary rounded transition-colors"
          title={column.isCollapsed ? 'Expand' : 'Collapse'}
        >
          {column.isCollapsed ? <ChevronDown size={22} /> : <ChevronUp size={22} />}
        </button>

        <DropdownMenu
          items={[
            {
              label: 'Rename',
              onClick: () => setIsEditing(true),
            },
            {
              label: column.isCollapsed ? 'Expand' : 'Collapse',
              onClick: () => toggleColumnCollapse(column.id),
            },
            {
              label: 'Delete',
              onClick: () => {
                if (
                  window.confirm(
                    `Delete "${column.title}" and all its missions? This cannot be undone.`
                  )
                ) {
                  deleteColumn(column.id);
                }
              },
              danger: true,
            },
          ]}
        />
      </div>
    </div>
  );
};
