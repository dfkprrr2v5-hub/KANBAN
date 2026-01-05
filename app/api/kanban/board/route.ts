import { NextRequest, NextResponse } from 'next/server';
import {
  readBoardForProject,
  writeBoardForProject,
  getDefaultProjectId,
  readProjectsIndex,
} from '@/lib/data/fileStorage';
import { Board } from '@/types/board';

// GET /api/kanban/board?projectId=xxx
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    let projectId = searchParams.get('projectId');

    // If no projectId provided, use default
    if (!projectId) {
      const defaultId = getDefaultProjectId();
      if (!defaultId) {
        return NextResponse.json(
          { error: 'No projects found. Please create a project first.' },
          { status: 404 }
        );
      }
      projectId = defaultId;
    }

    // Verify project exists
    const projectsIndex = readProjectsIndex();
    const projectExists = projectsIndex?.projects.some((p) => p.id === projectId);

    if (!projectExists) {
      return NextResponse.json(
        { error: `Project ${projectId} not found` },
        { status: 404 }
      );
    }

    const board = readBoardForProject(projectId);

    if (!board) {
      // Create default board for this project
      const project = projectsIndex?.projects.find((p) => p.id === projectId);
      const defaultBoard: Board = {
        id: `board-${projectId}`,
        projectId: projectId,
        title: project?.name || 'Tactical Operations',
        columns: [
          {
            id: 'col-todo',
            title: 'TODO',
            position: 0,
            cardIds: [],
            createdAt: new Date().toISOString(),
          },
          {
            id: 'col-in-progress',
            title: 'In Progress',
            position: 1,
            cardIds: [],
            createdAt: new Date().toISOString(),
          },
          {
            id: 'col-completed',
            title: 'Completed',
            position: 2,
            cardIds: [],
            createdAt: new Date().toISOString(),
          },
        ],
        cards: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Initialize the board file
      writeBoardForProject(projectId, defaultBoard);

      console.log('[API] Created default board for project:', projectId);

      return NextResponse.json({ board: defaultBoard }, { status: 200 });
    }

    return NextResponse.json({ board }, { status: 200 });
  } catch (error) {
    console.error('[API] Error fetching board:', error);
    return NextResponse.json(
      { error: 'Failed to fetch board', details: String(error) },
      { status: 500 }
    );
  }
}
