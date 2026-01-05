'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useBoardStore } from '@/lib/store/boardStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Plus } from 'lucide-react';

export const AddColumnButton = () => {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const addColumn = useBoardStore((state) => state.addColumn);

  const handleAdd = () => {
    if (!title.trim()) return;

    addColumn(title.trim());
    setTitle('');
    setIsAdding(false);
  };

  if (!isAdding) {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsAdding(true)}
        className="w-80 flex-shrink-0 h-32 flex items-center justify-center border-2 border-dashed border-border-primary rounded-lg
                   hover:border-accent-primary transition-colors group flex-col gap-2"
      >
        <Plus size={24} className="text-text-muted group-hover:text-accent-primary" />
        <span className="text-text-muted group-hover:text-accent-primary font-mono text-sm font-semibold uppercase">
          New Sector
        </span>
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="w-80 flex-shrink-0 p-4 bg-background-secondary rounded-lg border-2 border-accent-primary"
    >
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Sector name..."
        autoFocus
        onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
        className="mb-3"
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
