'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/lib/store/uiStore';
import { useProjectStore } from '@/lib/store/projectStore';
import { useBoardStore } from '@/lib/store/boardStore';
import { X, Plus, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';
import { ProjectListItem } from './ProjectListItem';
import { ProjectModal } from './ProjectModal';

export const ProjectSidebar = () => {
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen);
  const closeSidebar = useUIStore((state) => state.closeSidebar);

  const projects = useProjectStore((state) => state.projects);
  const currentProjectId = useProjectStore((state) => state.currentProjectId);
  const setCurrentProject = useProjectStore((state) => state.setCurrentProject);

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

  const handleSelectProject = async (projectId: string) => {
    if (projectId === currentProjectId) {
      closeSidebar();
      return;
    }

    // Set current project
    setCurrentProject(projectId);

    // Load board for new project
    const loadBoard = useBoardStore.getState().loadBoard;
    await loadBoard();

    closeSidebar();
  };

  const handleCreateProject = () => {
    setEditingProjectId(null);
    setIsProjectModalOpen(true);
  };

  const handleEditProject = (projectId: string) => {
    setEditingProjectId(projectId);
    setIsProjectModalOpen(true);
  };

  return (
    <>
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeSidebar}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />

            {/* Sidebar Panel */}
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={cn(
                'fixed left-0 top-0 bottom-0 z-50',
                'w-80 bg-background-secondary',
                'border-r-2 border-border-primary',
                'flex flex-col'
              )}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b-2 border-border-primary">
                <div className="flex items-center gap-3">
                  <FolderOpen className="w-5 h-5 text-accent-primary" />
                  <h2 className="text-lg font-bold text-text-primary font-mono uppercase tracking-wider">
                    Projects
                  </h2>
                </div>
                <button
                  onClick={closeSidebar}
                  className="p-1 text-text-muted hover:text-accent-primary transition-colors"
                  title="Close sidebar"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Project List */}
              <div className="flex-1 overflow-y-auto p-4">
                {projects.length === 0 ? (
                  <div className="text-center py-12 text-text-muted font-mono text-sm">
                    No projects yet.
                    <br />
                    Create one to get started.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {projects.map((project) => (
                      <ProjectListItem
                        key={project.id}
                        project={project}
                        isActive={project.id === currentProjectId}
                        onSelect={handleSelectProject}
                        onEdit={handleEditProject}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Footer - Create Button */}
              <div className="p-4 border-t-2 border-border-primary">
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleCreateProject}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Project
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Project Modal */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => {
          setIsProjectModalOpen(false);
          setEditingProjectId(null);
        }}
        projectId={editingProjectId}
      />
    </>
  );
};
