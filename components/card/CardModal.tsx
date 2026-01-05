'use client';

import { useState, useEffect } from 'react';
import { useUIStore } from '@/lib/store/uiStore';
import { useBoardStore } from '@/lib/store/boardStore';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';

export const CardModal = () => {
  const { isCardModalOpen, editingCardId, closeCardModal } = useUIStore();
  const { board, updateCard, deleteCard } = useBoardStore();

  const card = editingCardId ? board.cards[editingCardId] : null;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>(
    'medium'
  );

  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setDescription(card.description);
      setPriority(card.priority || 'medium');
    }
  }, [card, isCardModalOpen]);

  const handleSave = () => {
    if (!editingCardId || !title.trim()) return;

    updateCard(editingCardId, {
      title: title.trim(),
      description: description.trim(),
      priority,
      updatedAt: new Date().toISOString(),
    });

    closeCardModal();
  };

  const handleDelete = () => {
    if (!editingCardId) return;

    if (window.confirm('Delete this mission? This cannot be undone.')) {
      deleteCard(editingCardId);
      closeCardModal();
    }
  };

  return (
    <Modal isOpen={isCardModalOpen} onClose={closeCardModal} title="MISSION BRIEF">
      <div className="space-y-4">
        <div>
          <label className="block text-text-secondary text-sm font-mono mb-2 uppercase tracking-wider font-semibold">
            Mission Title *
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter mission title..."
            autoFocus
          />
        </div>

        <div>
          <label className="block text-text-secondary text-sm font-mono mb-2 uppercase tracking-wider font-semibold">
            Mission Brief
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter mission details and objectives..."
            rows={6}
          />
        </div>

        <div>
          <label className="block text-text-secondary text-sm font-mono mb-2 uppercase tracking-wider font-semibold">
            Priority Level
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(['low', 'medium', 'high', 'critical'] as const).map((level) => (
              <button
                key={level}
                onClick={() => setPriority(level)}
                className={`px-3 py-2 text-xs rounded font-mono uppercase font-semibold transition-all ${
                  priority === level
                    ? 'bg-accent-primary text-background-primary'
                    : 'bg-background-tertiary text-text-muted hover:text-text-primary border border-border-primary'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between pt-6 border-t border-border-primary">
          <Button variant="danger" onClick={handleDelete} size="md">
            Delete Mission
          </Button>

          <div className="flex gap-2">
            <Button variant="ghost" onClick={closeCardModal} size="md">
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={!title.trim()}
              size="md"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
