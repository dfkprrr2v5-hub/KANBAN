export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  lastAccessedAt: string;
}

export interface ProjectsIndex {
  projects: Project[];
  defaultProjectId: string | null;
  updatedAt: string;
}

export interface CreateProjectDTO {
  name: string;
  description?: string;
}
