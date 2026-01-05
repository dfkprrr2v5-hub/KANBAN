import fs from 'fs';
import path from 'path';
import { Board } from '@/types/board';
import { Project, ProjectsIndex } from '@/types/project';

// File paths
const DATA_DIR = path.join(process.cwd(), 'data');
const BOARDS_DIR = path.join(DATA_DIR, 'boards');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');
const OLD_BOARD_FILE = path.join(DATA_DIR, 'board.json');
const BACKUP_FILE = path.join(DATA_DIR, 'board.json.backup');

// Ensure directories exist
function ensureDataDirs() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(BOARDS_DIR)) {
    fs.mkdirSync(BOARDS_DIR, { recursive: true });
  }
}

// ============================================================================
// PROJECTS INDEX OPERATIONS
// ============================================================================

export function readProjectsIndex(): ProjectsIndex | null {
  try {
    ensureDataDirs();

    // Check if migration is needed
    if (!fs.existsSync(PROJECTS_FILE) && fs.existsSync(OLD_BOARD_FILE)) {
      console.log('[FileStorage] Migration needed - running automatic migration...');
      migrateToMultiProject();
    }

    if (!fs.existsSync(PROJECTS_FILE)) {
      return null;
    }

    const data = fs.readFileSync(PROJECTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('[FileStorage] Error reading projects index:', error);
    return null;
  }
}

export function writeProjectsIndex(index: ProjectsIndex): boolean {
  try {
    ensureDataDirs();
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify(index, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('[FileStorage] Error writing projects index:', error);
    return false;
  }
}

// ============================================================================
// BOARD OPERATIONS (PER PROJECT)
// ============================================================================

export function readBoardForProject(projectId: string): Board | null {
  try {
    ensureDataDirs();
    const boardFile = path.join(BOARDS_DIR, `${projectId}.json`);

    if (!fs.existsSync(boardFile)) {
      return null;
    }

    const data = fs.readFileSync(boardFile, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`[FileStorage] Error reading board for project ${projectId}:`, error);
    return null;
  }
}

export function writeBoardForProject(projectId: string, board: Board): boolean {
  try {
    ensureDataDirs();
    const boardFile = path.join(BOARDS_DIR, `${projectId}.json`);
    fs.writeFileSync(boardFile, JSON.stringify(board, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error(`[FileStorage] Error writing board for project ${projectId}:`, error);
    return false;
  }
}

export function deleteBoardForProject(projectId: string): boolean {
  try {
    const boardFile = path.join(BOARDS_DIR, `${projectId}.json`);

    if (fs.existsSync(boardFile)) {
      fs.unlinkSync(boardFile);
    }

    return true;
  } catch (error) {
    console.error(`[FileStorage] Error deleting board for project ${projectId}:`, error);
    return false;
  }
}

// ============================================================================
// MIGRATION LOGIC
// ============================================================================

export function migrateToMultiProject(): boolean {
  try {
    console.log('[FileStorage] Starting migration to multi-project...');

    // 1. Check if old board.json exists
    if (!fs.existsSync(OLD_BOARD_FILE)) {
      console.log('[FileStorage] No old board.json found, nothing to migrate');
      return false;
    }

    // 2. Read old board
    const oldBoardData = fs.readFileSync(OLD_BOARD_FILE, 'utf-8');
    const oldBoard: Board = JSON.parse(oldBoardData);

    console.log('[FileStorage] Old board loaded:', oldBoard.title);

    // 3. Create default project
    const defaultProjectId = 'project-default';
    const defaultProject: Project = {
      id: defaultProjectId,
      name: oldBoard.title || 'Tactical Operations',
      description: 'Migrated from single board',
      createdAt: oldBoard.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastAccessedAt: new Date().toISOString(),
    };

    // 4. Create projects index
    const projectsIndex: ProjectsIndex = {
      projects: [defaultProject],
      defaultProjectId: defaultProjectId,
      updatedAt: new Date().toISOString(),
    };

    // 5. Migrate board with projectId
    const migratedBoard: Board = {
      ...oldBoard,
      projectId: defaultProjectId,
    };

    // 6. Write projects index
    ensureDataDirs();
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projectsIndex, null, 2), 'utf-8');
    console.log('[FileStorage] Projects index created');

    // 7. Write migrated board to new location
    const newBoardFile = path.join(BOARDS_DIR, `${defaultProjectId}.json`);
    fs.writeFileSync(newBoardFile, JSON.stringify(migratedBoard, null, 2), 'utf-8');
    console.log('[FileStorage] Board migrated to new location');

    // 8. Create backup of old file
    fs.copyFileSync(OLD_BOARD_FILE, BACKUP_FILE);
    console.log('[FileStorage] Backup created at:', BACKUP_FILE);

    // 9. Remove old file
    fs.unlinkSync(OLD_BOARD_FILE);
    console.log('[FileStorage] Old board.json removed');

    console.log('[FileStorage] Migration completed successfully!');
    return true;
  } catch (error) {
    console.error('[FileStorage] Migration failed:', error);
    return false;
  }
}

// ============================================================================
// BACKWARD COMPATIBILITY (Legacy API)
// ============================================================================

/**
 * @deprecated Use readBoardForProject() with a specific projectId instead
 */
export function readBoard(): Board | null {
  try {
    // Try to get default project
    const projectsIndex = readProjectsIndex();

    if (!projectsIndex || !projectsIndex.defaultProjectId) {
      // Fallback to old behavior
      ensureDataDirs();
      if (fs.existsSync(OLD_BOARD_FILE)) {
        const data = fs.readFileSync(OLD_BOARD_FILE, 'utf-8');
        return JSON.parse(data);
      }
      return null;
    }

    return readBoardForProject(projectsIndex.defaultProjectId);
  } catch (error) {
    console.error('[FileStorage] Error reading board:', error);
    return null;
  }
}

/**
 * @deprecated Use writeBoardForProject() with a specific projectId instead
 */
export function writeBoard(board: Board): boolean {
  try {
    // If board has projectId, use new API
    if (board.projectId) {
      return writeBoardForProject(board.projectId, board);
    }

    // Fallback to old behavior
    ensureDataDirs();
    fs.writeFileSync(OLD_BOARD_FILE, JSON.stringify(board, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('[FileStorage] Error writing board:', error);
    return false;
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getDefaultProjectId(): string | null {
  const projectsIndex = readProjectsIndex();
  return projectsIndex?.defaultProjectId || null;
}

export function setDefaultProjectId(projectId: string): boolean {
  const projectsIndex = readProjectsIndex();

  if (!projectsIndex) {
    return false;
  }

  projectsIndex.defaultProjectId = projectId;
  projectsIndex.updatedAt = new Date().toISOString();

  return writeProjectsIndex(projectsIndex);
}
