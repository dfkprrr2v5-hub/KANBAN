'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Keyboard } from 'lucide-react';
import { ALL_SHORTCUTS } from '@/lib/hooks/useBoardShortcuts';
import { cn } from '@/lib/utils/cn';

export const ShortcutsModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleShowShortcuts = () => setIsOpen(true);
    window.addEventListener('show-shortcuts', handleShowShortcuts);
    return () => window.removeEventListener('show-shortcuts', handleShowShortcuts);
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50',
              'w-full max-w-md',
              'bg-background-secondary border-2 border-border-primary rounded-lg',
              'shadow-2xl shadow-black/50'
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b-2 border-border-primary">
              <div className="flex items-center gap-3">
                <Keyboard className="w-5 h-5 text-accent-primary" />
                <h2 className="text-lg font-mono font-bold text-text-primary">
                  KEYBOARD SHORTCUTS
                </h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-text-muted hover:text-text-primary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Shortcuts List */}
            <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
              {ALL_SHORTCUTS.map((shortcut, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 px-3 rounded-md bg-background-tertiary/50"
                >
                  <span className="text-text-secondary text-sm font-mono">
                    {shortcut.description}
                  </span>
                  <kbd
                    className={cn(
                      'px-2 py-1 text-xs font-mono font-bold',
                      'bg-background-primary text-accent-primary',
                      'border border-border-primary rounded'
                    )}
                  >
                    {shortcut.key}
                  </kbd>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t-2 border-border-primary">
              <p className="text-text-muted text-xs font-mono text-center">
                Press <kbd className="px-1 bg-background-tertiary rounded">ESC</kbd> to close
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
