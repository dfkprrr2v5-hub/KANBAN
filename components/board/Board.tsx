'use client';

import { useEffect, useCallback, useRef } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useBoardStore } from '@/lib/store/boardStore';
import { useUIStore } from '@/lib/store/uiStore';
import { useSearchStore } from '@/lib/store/searchStore';
import { useHistoryStore } from '@/lib/store/historyStore';
import { useBoardShortcuts } from '@/lib/hooks/useBoardShortcuts';
import { Column } from './Column';
import { BoardHeader } from './BoardHeader';
import { AddColumnButton } from './AddColumnButton';
import { Card } from '@/components/card/Card';
import { CardModal } from '@/components/card/CardModal';
import { SearchBar } from '@/components/search/SearchBar';
import { ShortcutsModal } from '@/components/ui/ShortcutsModal';
import { AICommandChat } from '@/components/ai/AICommandChat';
import { GridPattern } from '@/components/ui/GridPattern';
import { ScanLines } from '@/components/ui/ScanLines';

export const Board = () => {
  const board = useBoardStore((state) => state.board);
  const activeCardId = useBoardStore((state) => state.activeCardId);
  const moveCard = useBoardStore((state) => state.moveCard);
  const moveColumn = useBoardStore((state) => state.moveColumn);
  const setDragging = useUIStore((state) => state.setDragging);
  const isSearchOpen = useSearchStore((state) => state.isSearchOpen);

  // History for undo/redo
  const { pushState, undo, redo } = useHistoryStore();
  const previousBoardRef = useRef(board);

  // Track board changes for history
  useEffect(() => {
    const currentBoardJson = JSON.stringify(board);
    const previousBoardJson = JSON.stringify(previousBoardRef.current);

    if (currentBoardJson !== previousBoardJson) {
      pushState(previousBoardRef.current, 'Board updated');
      previousBoardRef.current = board;
    }
  }, [board, pushState]);

  // Initialize history with initial board state
  useEffect(() => {
    pushState(board, 'Initial state');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUndo = useCallback(() => {
    const previousBoard = undo();
    if (previousBoard) {
      useBoardStore.setState({ board: previousBoard });
      previousBoardRef.current = previousBoard;
    }
  }, [undo]);

  const handleRedo = useCallback(() => {
    const nextBoard = redo();
    if (nextBoard) {
      useBoardStore.setState({ board: nextBoard });
      previousBoardRef.current = nextBoard;
    }
  }, [redo]);

  // Register keyboard shortcuts
  useBoardShortcuts({
    onUndo: handleUndo,
    onRedo: handleRedo,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const sortedColumns = [...board.columns].sort((a, b) => a.position - b.position);
  const activeCard = activeCardId ? board.cards[activeCardId] : null;

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const dragType = active.data.current?.type;
    setDragging(true, dragType as 'card' | 'column');
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;

    // Handle card dragging over different columns
    if (activeType === 'card' && overType === 'column') {
      // Visual feedback handled by DragOverlay
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setDragging(false);

    if (!over) return;

    const activeType = active.data.current?.type;
    const activeId = active.id as string;

    if (activeType === 'card') {
      const targetColumnId = over.data.current?.columnId || (over.data.current?.type === 'column' ? over.id : active.data.current?.columnId);
      const targetCardId = over.data.current?.cardId;

      if (!targetColumnId) return;

      const targetColumn = board.columns.find((c) => c.id === targetColumnId);
      if (!targetColumn) return;

      let newPosition = 0;
      if (targetCardId) {
        newPosition = targetColumn.cardIds.indexOf(targetCardId as string);
        if (newPosition === -1) newPosition = targetColumn.cardIds.length;
      } else {
        newPosition = targetColumn.cardIds.length;
      }

      moveCard(activeId, targetColumnId as string, newPosition);
    } else if (activeType === 'column') {
      const overIndex = sortedColumns.findIndex((c) => c.id === over.id);
      if (overIndex !== -1) {
        moveColumn(activeId, overIndex);
      }
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-background-primary overflow-hidden flex flex-col">
      {/* Background effects */}
      <GridPattern />
      <ScanLines />

      {/* Search Bar */}
      <SearchBar />

      {/* Header with controls */}
      <BoardHeader onUndo={handleUndo} onRedo={handleRedo} />

      {/* Board content */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className={`relative z-10 p-8 flex-1 overflow-hidden flex flex-col ${isSearchOpen ? 'mt-28' : ''}`}>
          <SortableContext
            items={sortedColumns.map((col) => col.id)}
            strategy={horizontalListSortingStrategy}
          >
            <div className="flex gap-6 overflow-x-auto pb-4 overflow-y-hidden flex-1">
              {sortedColumns.map((column) => (
                <Column key={column.id} column={column} />
              ))}
              <AddColumnButton />
            </div>
          </SortableContext>
        </div>

        {/* Drag overlay for smooth dragging */}
        <DragOverlay>
          {activeCard ? (
            <div className="rotate-[2deg]">
              <Card card={activeCard} isDragging />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Modal for editing cards */}
      <CardModal />

      {/* Shortcuts help modal */}
      <ShortcutsModal />

      {/* AI Command Center */}
      <AICommandChat />
    </div>
  );
};
