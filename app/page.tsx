'use client';

import { useEffect, useState } from 'react';
import { useBoardStore } from '@/lib/store/boardStore';
import { useProjectStore } from '@/lib/store/projectStore';
import { Board } from '@/components/board/Board';

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const loadBoard = useBoardStore((state) => state.loadBoard);
  const loadProjects = useProjectStore((state) => state.loadProjects);
  const isLoading = useBoardStore((state) => state.isLoading);
  const error = useBoardStore((state) => state.error);

  useEffect(() => {
    // Load projects first, then load board
    const initialize = async () => {
      try {
        console.log('[App] Loading projects...');
        await loadProjects();

        console.log('[App] Loading board...');
        await loadBoard();

        console.log('[App] Initialization complete');
        setIsLoaded(true);
      } catch (error) {
        console.error('[App] Initialization failed:', error);
        setIsLoaded(true); // Show error state
      }
    };

    initialize();

    // Auto-refresh every 5 seconds to sync with MCP changes
    const interval = setInterval(() => {
      const refreshBoard = useBoardStore.getState().refreshBoard;
      refreshBoard();
    }, 5000);

    return () => clearInterval(interval);
  }, [loadBoard, loadProjects]);

  if (!isLoaded || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-primary">
        <div className="text-center">
          <div className="text-4xl font-mono font-bold text-accent-primary mb-4">
            ▢ TACTICAL OPS
          </div>
          <div className="text-text-muted font-mono text-sm">
            {error ? `ERROR: ${error}` : 'INITIALIZING COMMAND CENTER...'}
          </div>
        </div>
      </div>
    );
  }

  return <Board />;
}
