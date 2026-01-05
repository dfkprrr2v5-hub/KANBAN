'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useBoardStore } from '@/lib/store/boardStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Plus } from 'lucide-react';

interface AddCardButtonProps {
  columnId: string;
}

export const AddCardButton = ({ columnId }: AddCardButtonProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const addCard = useBoardStore((state) => state.addCard);

  const handleAdd = () => {
    if (!title.trim()) return;

    addCard(columnId, title.trim(), '');
    setTitle('');
    setIsAdding(false);
  };

  if (!isAdding) {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsAdding(true)}
        className="w-full py-3 px-4 rounded-md border-2 border-dashed border-border-primary
                   hover:border-accent-primary transition-colors group flex items-center justify-center gap-2"
      >
        <Plus size={16} className="text-text-muted group-hover:text-accent-primary" />
        <span className="text-text-muted group-hover:text-accent-primary font-mono text-sm font-semibold uppercase">
          Add Mission
        </span>
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-3 bg-background-tertiary rounded-md border-2 border-accent-primary"
    >
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Mission title..."
        autoFocus
        onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
        className="mb-2"
      />
      <div className="flex gap-2">
        <Button size="sm" variant="primary" onClick={handleAdd} className="flex-1">
          Add
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setIsAdding(false);
            setTitle('');
          }}
          className="flex-1"
        >
          Cancel
        </Button>
      </div>
    </motion.div>
  );
};
