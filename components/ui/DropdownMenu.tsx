'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface MenuItem {
  label: string;
  onClick: () => void;
  danger?: boolean;
}

interface DropdownMenuProps {
  items: MenuItem[];
  className?: string;
}

export const DropdownMenu = ({ items, className }: DropdownMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={menuRef} className={cn('relative', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 text-text-muted hover:text-accent-primary hover:bg-background-tertiary rounded transition-colors"
      >
        <MoreVertical size={20} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-1 bg-background-secondary border-2 border-border-primary rounded-lg shadow-2xl shadow-black/50 z-[100] min-w-40 overflow-hidden"
            style={{ backgroundColor: '#111827' }}
          >
            {items.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  item.onClick();
                  setIsOpen(false);
                }}
                className={cn(
                  'w-full px-4 py-2 text-sm font-mono text-left transition-colors',
                  'first:rounded-t-[5px] last:rounded-b-[5px]',
                  'hover:bg-background-tertiary',
                  item.danger
                    ? 'text-status-danger hover:bg-status-danger/10'
                    : 'text-text-secondary hover:text-text-primary',
                  index < items.length - 1 && 'border-b border-border-primary'
                )}
              >
                {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
