'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useProjectStore } from '@/lib/store/projectStore';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string | null;
}

export const ProjectModal = ({ isOpen, onClose, projectId }: ProjectModalProps) => {
  const projects = useProjectStore((state) => state.projects);
  const createProject = useProjectStore((state) => state.createProject);
  const updateProject = useProjectStore((state) => state.updateProject);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!projectId;
  const project = projectId ? projects.find((p) => p.id === projectId) : null;

  // Load project data when editing
  useEffect(() => {
    if (isEditing && project) {
      setName(project.name);
      setDescription(project.description || '');
    } else {
      setName('');
      setDescription('');
    }
  }, [isEditing, project, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Project name is required');
      return;
    }

    if (name.length > 50) {
      alert('Project name must be 50 characters or less');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditing && projectId) {
        await updateProject(projectId, {
          name: name.trim(),
          description: description.trim() || undefined,
        });
      } else {
        await createProject(name.trim(), description.trim() || undefined);
      }
      onClose();
    } catch (error) {
      console.error('Failed to save project:', error);
      alert(`Failed to ${isEditing ? 'update' : 'create'} project`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Project' : 'Create New Project'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Project Name */}
        <div>
          <label htmlFor="project-name" className="block text-sm font-mono font-bold text-text-primary mb-2">
            Project Name *
          </label>
          <Input
            id="project-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Mobile App Redesign"
            maxLength={50}
            autoFocus
            disabled={isSubmitting}
          />
          <div className="mt-1 text-xs text-text-muted font-mono">
            {name.length}/50 characters
          </div>
        </div>

        {/* Project Description */}
        <div>
          <label htmlFor="project-description" className="block text-sm font-mono font-bold text-text-primary mb-2">
            Description (Optional)
          </label>
          <textarea
            id="project-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of the project..."
            maxLength={200}
            rows={3}
            disabled={isSubmitting}
            className="w-full px-3 py-2 bg-background-tertiary border-2 border-border-primary rounded text-text-primary font-mono text-sm placeholder-text-muted focus:outline-none focus:border-accent-primary transition-colors resize-none"
          />
          <div className="mt-1 text-xs text-text-muted font-mono">
            {description.length}/200 characters
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting || !name.trim()}
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Update' : 'Create'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
