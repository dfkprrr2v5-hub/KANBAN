import { NextRequest, NextResponse } from 'next/server';
import {
  readProjectsIndex,
  writeProjectsIndex,
  readBoardForProject,
  writeBoardForProject
} from '@/lib/data/fileStorage';
import { Project, ProjectsIndex } from '@/types/project';
import { Board } from '@/types/board';

// GET /api/kanban/projects - List all projects
export async function GET() {
  try {
    const projectsIndex = readProjectsIndex();

    if (!projectsIndex) {
      // No projects yet - return empty list
      return NextResponse.json(
        { projects: [], defaultProjectId: null },
        { status: 200 }
      );
    }

    return NextResponse.json(projectsIndex, { status: 200 });
  } catch (error) {
    console.error('[API] Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// POST /api/kanban/projects - Create new project
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description } = body;

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      );
    }

    if (name.length > 50) {
      return NextResponse.json(
        { error: 'Project name must be 50 characters or less' },
        { status: 400 }
      );
    }

    // Get or create projects index
    let projectsIndex = readProjectsIndex();

    if (!projectsIndex) {
      projectsIndex = {
        projects: [],
        defaultProjectId: null,
        updatedAt: new Date().toISOString(),
      };
    }

    // Generate unique project ID
    const projectId = `project-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Create new project
    const newProject: Project = {
      id: projectId,
      name: name.trim(),
      description: description?.trim() || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastAccessedAt: new Date().toISOString(),
    };

    // Add to projects list
    projectsIndex.projects.push(newProject);
    projectsIndex.updatedAt = new Date().toISOString();

    // If this is the first project, make it default
    if (projectsIndex.projects.length === 1) {
      projectsIndex.defaultProjectId = projectId;
    }

    // Save projects index
    const success = writeProjectsIndex(projectsIndex);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to save project' },
        { status: 500 }
      );
    }

    // Create empty board for this project
    const emptyBoard: Board = {
      id: `board-${projectId}`,
      projectId: projectId,
      title: newProject.name,
      columns: [],
      cards: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const boardSuccess = writeBoardForProject(projectId, emptyBoard);

    if (!boardSuccess) {
      console.error('[API] Failed to create board for new project');
      // Continue anyway - board will be created on first access
    }

    console.log('[API] Project created:', newProject.id, newProject.name);

    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    console.error('[API] Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
