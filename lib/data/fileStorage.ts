import fs from 'fs';
import path from 'path';
import { Board } from '@/types';

const STORAGE_FILE = path.join(process.cwd(), 'data', 'board.json');

// Ensure data directory exists
function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

export function readBoard(): Board | null {
  try {
    ensureDataDir();
    if (!fs.existsSync(STORAGE_FILE)) {
      return null;
    }
    const data = fs.readFileSync(STORAGE_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading board:', error);
    return null;
  }
}

export function writeBoard(board: Board): boolean {
  try {
    ensureDataDir();
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(board, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error writing board:', error);
    return false;
  }
}
