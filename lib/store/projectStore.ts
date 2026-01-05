'use client';

import { create } from 'zustand';
import { Project, ProjectsIndex } from '@/types/project';
import { apiClient } from '@/lib/services/apiClient';

interface ProjectState {
  projects: Project[];
  currentProjectId: string | null;
  defaultProjectId: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadProjects: () => Promise<void>;
  createProject: (name: string, description?: string) => Promise<Project>;
  updateProject: (id: string, updates: Partial<Omit<Project, 'id' | 'createdAt'>>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  setCurrentProject: (id: string) => void;
  updateLastAccessed: (id: string) => Promise<void>;

  // Selectors
  getCurrentProject: () => Project | null;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProjectId: null,
  defaultProjectId: null,
  isLoading: false,
  error: null,

  loadProjects: async () => {
    try {
      set({ isLoading: true, error: null });
      const projectsIndex: ProjectsIndex = await apiClient.getProjects();

      set({
        projects: projectsIndex.projects,
        defaultProjectId: projectsIndex.defaultProjectId,
        currentProjectId: projectsIndex.defaultProjectId, // Start with default project
        isLoading: false,
      });

      console.log('[ProjectStore] Projects loaded:', projectsIndex.projects.length);
    } catch (error) {
      console.error('[ProjectStore] Failed to load projects:', error);
      set({ error: String(error), isLoading: false });
    }
  },

  createProject: async (name: string, description?: string) => {
    try {
      set({ isLoading: true, error: null });

      const newProject = await apiClient.createProject({ name, description });

      set((state) => ({
        projects: [...state.projects, newProject],
        isLoading: false,
      }));

      console.log('[ProjectStore] Project created:', newProject.name);
      return newProject;
    } catch (error) {
      console.error('[ProjectStore] Failed to create project:', error);
      set({ error: String(error), isLoading: false });
      throw error;
    }
  },

  updateProject: async (id: string, updates: Partial<Omit<Project, 'id' | 'createdAt'>>) => {
    try {
      set({ isLoading: true, error: null });

      const updatedProject = await apiClient.updateProject(id, updates);

      set((state) => ({
        projects: state.projects.map((p) => (p.id === id ? updatedProject : p)),
        isLoading: false,
      }));

      console.log('[ProjectStore] Project updated:', updatedProject.name);
    } catch (error) {
      console.error('[ProjectStore] Failed to update project:', error);
      set({ error: String(error), isLoading: false });
      throw error;
    }
  },

  deleteProject: async (id: string) => {
    try {
      set({ isLoading: true, error: null });

      await apiClient.deleteProject(id);

      set((state) => {
        const remainingProjects = state.projects.filter((p) => p.id !== id);
        const newCurrentId = state.currentProjectId === id
          ? (remainingProjects[0]?.id || null)
          : state.currentProjectId;

        return {
          projects: remainingProjects,
          currentProjectId: newCurrentId,
          isLoading: false,
        };
      });

      console.log('[ProjectStore] Project deleted:', id);
    } catch (error) {
      console.error('[ProjectStore] Failed to delete project:', error);
      set({ error: String(error), isLoading: false });
      throw error;
    }
  },

  setCurrentProject: (id: string) => {
    const state = get();
    const project = state.projects.find((p) => p.id === id);

    if (!project) {
      console.error('[ProjectStore] Project not found:', id);
      return;
    }

    set({ currentProjectId: id });
    console.log('[ProjectStore] Current project set to:', project.name);

    // Update last accessed time (fire and forget)
    get().updateLastAccessed(id);
  },

  updateLastAccessed: async (id: string) => {
    try {
      const now = new Date().toISOString();
      await apiClient.updateProject(id, { lastAccessedAt: now });

      // Update local state
      set((state) => ({
        projects: state.projects.map((p) =>
          p.id === id ? { ...p, lastAccessedAt: now } : p
        ),
      }));
    } catch (error) {
      console.error('[ProjectStore] Failed to update last accessed:', error);
      // Don't throw - this is a non-critical operation
    }
  },

  getCurrentProject: () => {
    const state = get();
    if (!state.currentProjectId) return null;
    return state.projects.find((p) => p.id === state.currentProjectId) || null;
  },
}));
