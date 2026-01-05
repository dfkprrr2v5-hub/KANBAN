'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, User, Loader2, Sparkles, Trash2 } from 'lucide-react';
import { useAIStore, ChatMessage } from '@/lib/store/aiStore';
import { useBoardStore } from '@/lib/store/boardStore';
import { sendAIMessage, executeAIAction } from '@/lib/services/aiService';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';

const MessageBubble = ({ message }: { message: ChatMessage }) => {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex gap-3', isUser ? 'flex-row-reverse' : 'flex-row')}
    >
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
          isUser
            ? 'bg-accent-primary text-background-primary'
            : 'bg-status-info text-white'
        )}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>
      <div
        className={cn(
          'max-w-[80%] px-4 py-3 rounded-lg font-mono text-sm',
          isUser
            ? 'bg-accent-primary/20 text-text-primary'
            : 'bg-background-tertiary text-text-primary'
        )}
      >
        <div className="whitespace-pre-wrap">{message.content}</div>
      </div>
    </motion.div>
  );
};

export const AICommandChat = () => {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { isOpen, messages, isLoading, closeChat, addMessage, setLoading, clearMessages } =
    useAIStore();

  const board = useBoardStore((state) => state.board);
  const addCard = useBoardStore((state) => state.addCard);
  const updateCard = useBoardStore((state) => state.updateCard);
  const deleteCard = useBoardStore((state) => state.deleteCard);
  const moveCard = useBoardStore((state) => state.moveCard);
  const addColumn = useBoardStore((state) => state.addColumn);
  const updateColumn = useBoardStore((state) => state.updateColumn);
  const deleteColumn = useBoardStore((state) => state.deleteColumn);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeChat();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeChat]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message
    addMessage({ role: 'user', content: userMessage });
    setLoading(true);

    try {
      // Send to AI
      const response = await sendAIMessage(userMessage, board);

      // Add AI response
      addMessage({ role: 'assistant', content: response.message });

      // Execute actions
      console.log('[AI] Executing actions:', response.actions);
      for (const action of response.actions) {
        console.log('[AI] Processing action:', action.type, action.data);
        if (action.type !== 'ask_clarification' && action.type !== 'board_summary' && action.type !== 'error') {
          const result = executeAIAction(action, board, {
            addCard,
            updateCard,
            deleteCard,
            moveCard,
            addColumn,
            updateColumn,
            deleteColumn,
          });
          console.log('[AI] Action result:', action.type, result);
        }
      }
    } catch (error) {
      addMessage({
        role: 'assistant',
        content: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeChat}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Chat Window */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50',
              'w-full max-w-2xl h-[600px] max-h-[80vh]',
              'bg-background-secondary border-2 border-accent-primary rounded-lg',
              'shadow-2xl shadow-accent-primary/20',
              'flex flex-col'
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b-2 border-border-primary">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent-primary/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-accent-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-mono font-bold text-text-primary">
                    AI COMMAND CENTER
                  </h2>
                  <p className="text-xs text-text-muted font-mono">
                    Ctrl+Space to toggle | Powered by Groq
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearMessages}
                  title="Clear chat"
                  className="text-text-muted hover:text-text-primary"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <button
                  onClick={closeChat}
                  className="p-2 text-text-muted hover:text-text-primary transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <Bot className="w-12 h-12 text-text-muted mx-auto mb-4" />
                  <p className="text-text-muted font-mono text-sm mb-4">
                    How can I help you today?
                  </p>
                  <div className="space-y-2 text-xs text-text-muted font-mono">
                    <p>Try saying:</p>
                    <div className="flex flex-wrap gap-2 justify-center mt-2">
                      {[
                        'Create a task to fix login bug',
                        'Cria uma tarefa de alta prioridade',
                        'What\'s the status of my board?',
                        'Add 3 test cards to TODO',
                      ].map((example) => (
                        <button
                          key={example}
                          onClick={() => setInput(example)}
                          className="px-3 py-1.5 bg-background-tertiary rounded-md hover:bg-accent-primary/20 hover:text-accent-primary transition-colors"
                        >
                          "{example}"
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}

              {isLoading && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-status-info flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex items-center gap-2 text-text-muted">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="font-mono text-sm">Thinking...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={handleSubmit}
              className="p-4 border-t-2 border-border-primary"
            >
              <div className="flex gap-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a command... (e.g., 'Create a task for...')"
                  disabled={isLoading}
                  className={cn(
                    'flex-1 px-4 py-3 font-mono text-sm',
                    'bg-background-tertiary text-text-primary',
                    'border-2 border-border-primary rounded-lg',
                    'placeholder:text-text-muted',
                    'focus:outline-none focus:border-accent-primary',
                    'disabled:opacity-50'
                  )}
                />
                <Button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="px-4"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
