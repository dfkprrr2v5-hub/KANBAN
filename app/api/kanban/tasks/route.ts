import { NextRequest, NextResponse } from 'next/server';
import {
  readBoardForProject,
  writeBoardForProject,
  getDefaultProjectId,
} from '@/lib/data/fileStorage';
import { generateId } from '@/lib/utils/id-generator';
import { Card } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get('projectId') || getDefaultProjectId();

    if (!projectId) {
      return NextResponse.json({ cards: [] }, { status: 200 });
    }

    const board = readBoardForProject(projectId);
    if (!board) {
      return NextResponse.json({ cards: [] }, { status: 200 });
    }

    const cards = Object.values(board.cards);
    return NextResponse.json({ cards }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch tasks', details: String(error) },
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
    const { title, description = '', columnId, columnName, priority = 'medium' } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const board = readBoardForProject(projectId);
    if (!board) {
      return NextResponse.json({ error: 'Board not initialized' }, { status: 500 });
    }

    // Find column
    let targetColumn = columnId
      ? board.columns.find((c) => c.id === columnId)
      : null;

    if (!targetColumn && columnName) {
      const normalizedName = columnName.toLowerCase().trim();
      targetColumn = board.columns.find((c) => {
        const colName = c.title.toLowerCase().trim();
        return (
          colName === normalizedName ||
          colName.includes(normalizedName) ||
          normalizedName.includes(colName)
        );
      });
    }

    if (!targetColumn) {
      targetColumn = board.columns[0];
    }

    if (!targetColumn) {
      return NextResponse.json({ error: 'No columns available' }, { status: 400 });
    }

    // Create new card
    const cardId = generateId('card');
    const now = new Date().toISOString();
    const newCard: Card = {
      id: cardId,
      title,
      description,
      columnId: targetColumn.id,
      position: targetColumn.cardIds.length,
      createdAt: now,
      updatedAt: now,
      priority: priority as Card['priority'],
    };

    // Update board
    board.cards[cardId] = newCard;
    board.columns = board.columns.map((col) =>
      col.id === targetColumn!.id
        ? { ...col, cardIds: [...col.cardIds, cardId] }
        : col
    );
    board.updatedAt = now;

    writeBoardForProject(projectId, board);

    return NextResponse.json({ card: newCard }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create task', details: String(error) },
      { status: 500 }
    );
  }
}
