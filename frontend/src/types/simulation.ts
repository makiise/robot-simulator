// In frontend/src/types/simulation.ts

// This defines all the possible things that can be in a single cell.
export type CellContent = 'EMPTY' | 'ROBOT' | 'BOMB' | 'GARBAGE';

// This describes the properties of a single cell on the grid.
export interface GridCell {
  content: CellContent;
  robotId?: string; // This will be used later
  taskId?: string;  // This will be used later
}

// This defines the entire grid: it's an array of rows, where each row is an array of GridCells.
export type GridData = GridCell[][];