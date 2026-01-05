'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { Card as CardType } from '@/types';
import { useUIStore } from '@/lib/store/uiStore';
import { MOTION_VARIANTS } from '@/lib/constants/animations';
import { cn } from '@/lib/utils/cn';

const priorityStyles: Record<string, string> = {
  low: 'bg-status-info/20 text-status-info',
  medium: 'bg-accent-primary/20 text-accent-primary',
  high: 'bg-status-warning/20 text-status-warning',
  critical: 'bg-status-danger/20 text-status-danger',
};

interface CardProps {
  card: CardType;
  isDragging?: boolean;
}

export const Card = ({ card, isDragging = false }: CardProps) => {
  const openCardModal = useUIStore((state) => state.openCardModal);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isDraggingActive,
  } = useSortable({
    id: card.id,
    data: { type: 'card', cardId: card.id, columnId: card.columnId },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      variants={MOTION_VARIANTS.card}
      initial="initial"
      animate="animate"
      exit="exit"
      whileHover={!isDraggingActive ? 'hover' : {}}
      whileTap="tap"
      onClick={() => openCardModal(card.id)}
      className={cn(
        'p-5 bg-background-tertiary rounded-md border-2 border-border-primary',
        'cursor-grab active:cursor-grabbing select-none',
        'transition-all duration-200',
        isDraggingActive && 'opacity-50 border-accent-primary',
        !isDraggingActive && 'hover:border-accent-primary'
      )}
    >
      <h3 className="text-text-primary font-semibold mb-2 font-mono text-base line-clamp-2">
        {card.title}
      </h3>

      {card.description && (
        <p className="text-text-muted text-sm line-clamp-2 font-mono mb-3">
          {card.description}
        </p>
      )}

      {card.priority && (
        <div
          className={cn(
            'inline-block px-3 py-1.5 text-sm rounded font-mono uppercase font-semibold',
            priorityStyles[card.priority] || priorityStyles.medium
          )}
        >
          {card.priority}
        </div>
      )}
    </motion.div>
  );
};
