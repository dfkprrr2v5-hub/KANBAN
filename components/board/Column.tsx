'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { motion } from 'framer-motion';
import { Column as ColumnType } from '@/types';
import { useBoardStore } from '@/lib/store/boardStore';
import { useSearchStore, filterCards } from '@/lib/store/searchStore';
import { ColumnHeader } from './ColumnHeader';
import { Card } from '@/components/card/Card';
import { AddCardButton } from '@/components/card/AddCardButton';
import { MOTION_VARIANTS } from '@/lib/constants/animations';
import { cn } from '@/lib/utils/cn';
import { useAutoAnimate } from '@formkit/auto-animate/react';

interface ColumnProps {
  column: ColumnType;
}

export const Column = ({ column }: ColumnProps) => {
  const board = useBoardStore((state) => state.board);
  const { searchQuery, priorityFilter, columnFilter } = useSearchStore();

  // Get filtered card IDs
  const filteredCardIds = filterCards(
    board.cards,
    searchQuery,
    priorityFilter,
    columnFilter
  );

  // Filter cards based on search and filters
  const cards = column.cardIds
    .map((id) => board.cards[id])
    .filter((card) => card && filteredCardIds.has(card.id));

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: { type: 'column', columnId: column.id },
  });

  const [parent] = useAutoAnimate();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={MOTION_VARIANTS.column}
      className={cn(
        'flex flex-col w-96 flex-shrink-0 bg-background-secondary rounded-lg border-2',
        'max-h-[calc(100vh-120px)]',
        isDragging ? 'border-accent-primary opacity-50' : 'border-border-primary'
      )}
    >
      <ColumnHeader
        column={column}
        dragHandleProps={{ ...attributes, ...listeners }}
      />

      {!column.isCollapsed && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div
            className="flex-1 overflow-y-auto p-4 space-y-4"
            ref={parent}
          >
            <SortableContext
              items={column.cardIds}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {cards.map((card) => (
                  <Card key={card.id} card={card} />
                ))}
              </div>
            </SortableContext>
          </div>

          <div className="p-4 border-t border-border-primary">
            <AddCardButton columnId={column.id} />
          </div>
        </div>
      )}
    </motion.div>
  );
};
