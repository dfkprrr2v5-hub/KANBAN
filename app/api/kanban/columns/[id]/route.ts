import { NextRequest, NextResponse } from 'next/server';
import { readBoard, writeBoard } from '@/lib/data/fileStorage';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title } = body;

    const board = readBoard();
    if (!board) {
      return NextResponse.json({ error: 'Board not found' }, { status: 404 });
    }

    const columnIndex = board.columns.findIndex((c) => c.id === id);
    if (columnIndex === -1) {
      return NextResponse.json({ error: 'Column not found' }, { status: 404 });
    }

    if (title !== undefined) {
      board.columns[columnIndex].title = title;
    }

    board.updatedAt = new Date().toISOString();

    writeBoard(board);

    return NextResponse.json({ column: board.columns[columnIndex] });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update column', details: String(error) },
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

    const column = board.columns.find((c) => c.id === id);
    if (!column) {
      return NextResponse.json({ error: 'Column not found' }, { status: 404 });
    }

    // Delete all cards in the column
    column.cardIds.forEach((cardId) => {
      delete board.cards[cardId];
    });

    // Remove column
    board.columns = board.columns.filter((c) => c.id !== id);

    board.updatedAt = new Date().toISOString();

    writeBoard(board);

    return NextResponse.json({ success: true, message: 'Column deleted' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete column', details: String(error) },
      { status: 500 }
    );
  }
}
