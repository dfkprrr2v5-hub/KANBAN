import { NextResponse } from 'next/server';
import { readBoard, writeBoard } from '@/lib/data/fileStorage';
import { Board } from '@/types';

export async function GET() {
  try {
    const board = readBoard();

    if (!board) {
      // Return default board structure
      const defaultBoard: Board = {
        id: 'default-board',
        title: 'Tactical Operations',
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
      writeBoard(defaultBoard);

      return NextResponse.json({ board: defaultBoard });
    }

    return NextResponse.json({ board });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch board', details: String(error) },
      { status: 500 }
    );
  }
}
