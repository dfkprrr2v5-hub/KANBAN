'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import { X } from 'lucide-react';
import { MOTION_VARIANTS } from '@/lib/constants/animations';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

export const Modal = ({ isOpen, onClose, title, children, className }: ModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            variants={MOTION_VARIANTS.modal.overlay}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
          <motion.div
            variants={MOTION_VARIANTS.modal.content}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl mx-auto"
          >
            <div
              className={cn(
                'bg-background-secondary border-2 border-border-primary rounded-lg shadow-2xl',
                'max-h-[90vh] overflow-y-auto',
                className
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {title && (
                <div className="flex items-center justify-between p-6 border-b-2 border-border-primary">
                  <h2 className="text-lg font-bold text-text-primary font-mono uppercase tracking-wider">
                    {title}
                  </h2>
                  <button
                    onClick={onClose}
                    className="p-1 text-text-muted hover:text-accent-primary transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
              )}
              <div className="p-6">{children}</div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
