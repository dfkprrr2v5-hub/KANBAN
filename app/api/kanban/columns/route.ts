import { NextRequest, NextResponse } from 'next/server';
import {
  readBoardForProject,
  writeBoardForProject,
  getDefaultProjectId,
} from '@/lib/data/fileStorage';
import { generateId } from '@/lib/utils/id-generator';
import { Column } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get('projectId') || getDefaultProjectId();

    if (!projectId) {
      return NextResponse.json({ columns: [] }, { status: 200 });
    }

    const board = readBoardForProject(projectId);
    if (!board) {
      return NextResponse.json({ columns: [] }, { status: 200 });
    }

    return NextResponse.json({ columns: board.columns }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch columns', details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get('projectId') || getDefaultProjectId();

    if (!projectId) {
      return NextResponse.json(
        { error: 'No project specified or found' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const board = readBoardForProject(projectId);
    if (!board) {
      return NextResponse.json({ error: 'Board not initialized' }, { status: 500 });
    }

    const columnId = generateId('col');
    const now = new Date().toISOString();
    const newColumn: Column = {
      id: columnId,
      title,
      position: board.columns.length,
      cardIds: [],
      createdAt: now,
    };

    board.columns.push(newColumn);
    board.updatedAt = now;

    writeBoardForProject(projectId, board);

    return NextResponse.json({ column: newColumn }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create column', details: String(error) },
      { status: 500 }
    );
  }
}
