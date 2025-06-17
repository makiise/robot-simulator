import { GridData, GridCell, CellContentType, Coordinate } from '@/types/common.types'; 

export class GridService {
  public initializeGrid(rows: number, cols: number): GridData {
    const grid: GridData = [];
    for (let y = 0; y < rows; y++) {
      const row: GridCell[] = [];
      for (let x = 0; x < cols; x++) {
        row.push({ content: CellContentType.EMPTY });
      }
      grid.push(row);
    }
    return grid;
  }

  public placeBombs(grid: GridData, bombCount: number = 3): GridData {
    const rows = grid.length;
    if (rows === 0) return grid;
    const cols = grid[0].length;
    if (cols === 0) return grid;

    let bombsPlaced = 0;
    const occupiedCells = new Set<string>(); // To ensure bombs are on distinct cells

    // \protection against infinite loop if our grid is too small for bombing
    const maxAttempts = rows * cols * 2;
    let attempts = 0;

    while (bombsPlaced < bombCount && attempts < maxAttempts) {
      const randX = Math.floor(Math.random() * cols);
      const randY = Math.floor(Math.random() * rows);
      const cellKey = `${randX}-${randY}`;

      if (grid[randY][randX].content === CellContentType.EMPTY && !occupiedCells.has(cellKey)) {
        grid[randY][randX] = { ...grid[randY][randX], content: CellContentType.BOMB, taskId: `bomb-${bombsPlaced + 1}` }; // Assign a temporary task ID
        occupiedCells.add(cellKey);
        bombsPlaced++;
      }
      attempts++;
    }
    if (bombsPlaced < bombCount) {
        console.warn(`Could only place ${bombsPlaced} out of ${bombCount} bombs.`);
    }
    return grid;
  }

  // coordinate boundaries checker
  public isWithinBounds(grid: GridData, { x, y }: Coordinate): boolean {
    const rows = grid.length;
    if (rows === 0) return false;
    const cols = grid[0].length;
    return y >= 0 && y < rows && x >= 0 && x < cols;
  }
}