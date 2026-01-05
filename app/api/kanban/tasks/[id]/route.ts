import { NextRequest, NextResponse } from 'next/server';
import { readBoard, writeBoard } from '@/lib/data/fileStorage';
import { Card } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const board = readBoard();
    if (!board) {
      return NextResponse.json({ error: 'Board not found' }, { status: 404 });
    }

    const card = board.cards[id];
    if (!card) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ card });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch task', details: String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, priority, columnId } = body;

    const board = readBoard();
    if (!board) {
      return NextResponse.json({ error: 'Board not found' }, { status: 404 });
    }

    const card = board.cards[id];
    if (!card) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Update card properties
    const now = new Date().toISOString();
    const updatedCard: Card = {
      ...card,
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(priority !== undefined && { priority: priority as Card['priority'] }),
      updatedAt: now,
    };

    // Handle column move
    if (columnId && columnId !== card.columnId) {
      const targetColumn = board.columns.find((c) => c.id === columnId);
      if (!targetColumn) {
        return NextResponse.json({ error: 'Target column not found' }, { status: 400 });
      }

      // Remove from old column
      board.columns = board.columns.map((col) =>
        col.id === card.columnId
          ? { ...col, cardIds: col.cardIds.filter((cid) => cid !== id) }
          : col
      );

      // Add to new column
      board.columns = board.columns.map((col) =>
        col.id === columnId
          ? { ...col, cardIds: [...col.cardIds, id] }
          : col
      );

      updatedCard.columnId = columnId;
      updatedCard.position = targetColumn.cardIds.length;
    }

    board.cards[id] = updatedCard;
    board.updatedAt = now;

    writeBoard(board);

    return NextResponse.json({ card: updatedCard });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update task', details: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const board = readBoard();
    if (!board) {
      return NextResponse.json({ error: 'Board not found' }, { status: 404 });
    }

    const card = board.cards[id];
    if (!card) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Remove from cards
    delete board.cards[id];

    // Remove from column
    board.columns = board.columns.map((col) =>
      col.id === card.columnId
        ? { ...col, cardIds: col.cardIds.filter((cid) => cid !== id) }
        : col
    );

    board.updatedAt = new Date().toISOString();

    writeBoard(board);

    return NextResponse.json({ success: true, message: 'Task deleted' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete task', details: String(error) },
      { status: 500 }
    );
  }
}
