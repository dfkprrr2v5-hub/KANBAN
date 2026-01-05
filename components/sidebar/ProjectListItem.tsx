'use client';

import { Project } from '@/types/project';
import { Edit2, Trash2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useProjectStore } from '@/lib/store/projectStore';
import { useState } from 'react';

interface ProjectListItemProps {
  project: Project;
  isActive: boolean;
  onSelect: (projectId: string) => void;
  onEdit: (projectId: string) => void;
}

export const ProjectListItem = ({
  project,
  isActive,
  onSelect,
  onEdit,
}: ProjectListItemProps) => {
  const deleteProject = useProjectStore((state) => state.deleteProject);
  const projects = useProjectStore((state) => state.projects);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = async () => {
    if (projects.length === 1) {
      alert('Cannot delete the last project');
      return;
    }

    if (showDeleteConfirm) {
      try {
        await deleteProject(project.id);
      } catch (error) {
        console.error('Failed to delete project:', error);
        alert('Failed to delete project');
      }
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
      setTimeout(() => setShowDeleteConfirm(false), 3000);
    }
  };

  return (
    <div
      className={cn(
        'group relative flex items-center gap-3 p-3 rounded-lg',
        'border-2 transition-all duration-200',
        'font-mono',
        isActive
          ? 'bg-accent-primary/10 border-accent-primary'
          : 'bg-background-tertiary border-border-primary hover:bg-background-tertiary/80 hover:border-border-secondary',
        'cursor-pointer'
      )}
      onClick={() => onSelect(project.id)}
    >
      {/* Active Indicator */}
      {isActive && (
        <CheckCircle2 className="w-4 h-4 text-accent-primary flex-shrink-0" />
      )}

      {/* Project Name */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold text-text-primary truncate">
          {project.name}
        </div>
        {project.description && (
          <div className="text-xs text-text-muted truncate mt-0.5">
            {project.description}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(project.id);
          }}
          className="p-1.5 hover:bg-background-primary rounded text-text-muted hover:text-accent-primary transition-colors"
          title="Edit project"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
          className={cn(
            'p-1.5 rounded transition-colors',
            showDeleteConfirm
              ? 'bg-red-500/20 text-red-400'
              : 'hover:bg-background-primary text-text-muted hover:text-red-400'
          )}
          title={showDeleteConfirm ? 'Click again to confirm' : 'Delete project'}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
