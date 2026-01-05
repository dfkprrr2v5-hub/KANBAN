import { NextRequest, NextResponse } from 'next/server';
import {
  readProjectsIndex,
  writeProjectsIndex,
  deleteBoardForProject,
} from '@/lib/data/fileStorage';
import { Project } from '@/types/project';

// GET /api/kanban/projects/[id] - Get project details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectsIndex = readProjectsIndex();

    if (!projectsIndex) {
      return NextResponse.json(
        { error: 'No projects found' },
        { status: 404 }
      );
    }

    const project = projectsIndex.projects.find((p) => p.id === id);

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(project, { status: 200 });
  } catch (error) {
    console.error('[API] Error fetching project:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

// PUT /api/kanban/projects/[id] - Update project
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, lastAccessedAt } = body;

    // Validation
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json(
          { error: 'Project name cannot be empty' },
          { status: 400 }
        );
      }

      if (name.length > 50) {
        return NextResponse.json(
          { error: 'Project name must be 50 characters or less' },
          { status: 400 }
        );
      }
    }

    const projectsIndex = readProjectsIndex();

    if (!projectsIndex) {
      return NextResponse.json(
        { error: 'No projects found' },
        { status: 404 }
      );
    }

    const projectIndex = projectsIndex.projects.findIndex((p) => p.id === id);

    if (projectIndex === -1) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Update project
    const updatedProject: Project = {
      ...projectsIndex.projects[projectIndex],
      ...(name !== undefined && { name: name.trim() }),
      ...(description !== undefined && { description: description?.trim() || undefined }),
      ...(lastAccessedAt !== undefined && { lastAccessedAt }),
      updatedAt: new Date().toISOString(),
    };

    projectsIndex.projects[projectIndex] = updatedProject;
    projectsIndex.updatedAt = new Date().toISOString();

    const success = writeProjectsIndex(projectsIndex);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update project' },
        { status: 500 }
      );
    }

    console.log('[API] Project updated:', updatedProject.id, updatedProject.name);

    return NextResponse.json(updatedProject, { status: 200 });
  } catch (error) {
    console.error('[API] Error updating project:', error);
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

// DELETE /api/kanban/projects/[id] - Delete project
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectsIndex = readProjectsIndex();

    if (!projectsIndex) {
      return NextResponse.json(
        { error: 'No projects found' },
        { status: 404 }
      );
    }

    // Check if project exists
    const projectIndex = projectsIndex.projects.findIndex((p) => p.id === id);

    if (projectIndex === -1) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Prevent deleting the last project
    if (projectsIndex.projects.length === 1) {
      return NextResponse.json(
        { error: 'Cannot delete the last project' },
        { status: 400 }
      );
    }

    const projectToDelete = projectsIndex.projects[projectIndex];

    // Remove project from list
    projectsIndex.projects.splice(projectIndex, 1);
    projectsIndex.updatedAt = new Date().toISOString();

    // If deleted project was default, set new default
    if (projectsIndex.defaultProjectId === id) {
      projectsIndex.defaultProjectId = projectsIndex.projects[0]?.id || null;
    }

    // Save updated projects index
    const success = writeProjectsIndex(projectsIndex);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete project' },
        { status: 500 }
      );
    }

    // Delete the project's board file
    deleteBoardForProject(id);

    console.log('[API] Project deleted:', projectToDelete.id, projectToDelete.name);

    return NextResponse.json(
      { message: 'Project deleted successfully', projectId: id },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API] Error deleting project:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}
