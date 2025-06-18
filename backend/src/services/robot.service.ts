import {
    BasicRobot,
    Coordinate,
    GridData,
    CellContentType,
    SimulationState, 
    BasicTask,
    BasicTaskType,
  } from '@/types/common.types';
  import { GridService } from './grid.service';

  const MOVEMENT_HP_COST = 1; 
  const FIXED_HEALTH_PACK_AMOUNT = 10;
  
  export class RobotService {
    private gridService: GridService;
  
    constructor() {
      this.gridService = new GridService();
    }
  
    /**
     * I'm using Manhattan distance for moving
     */
    private calculateManhattanDistance(pos1: Coordinate, pos2: Coordinate): number {
      return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
    }
  
    
    public calculateNextStep(
      robot: BasicRobot,
      targetPos: Coordinate,
      grid: GridData,
    ): Coordinate | null {
      if (!grid || grid.length === 0 || !grid[0] || grid[0].length === 0) {
        console.error('Grid is not properly initialized for calculateNextStep.');
        return null;
      }
  
      const currentPos: Coordinate = { x: robot.x, y: robot.y };
      let minDistanceToTarget = this.calculateManhattanDistance(currentPos, targetPos);
  
      // If already at target, no move needed
      if (minDistanceToTarget === 0) {
        return null; // is robot at the target?
      }
  
      let bestStep: Coordinate | null = null;
  
     
      const potentialMoves: Coordinate[] = [
        { x: currentPos.x, y: currentPos.y - 1 }, 
        { x: currentPos.x, y: currentPos.y + 1 }, 
        { x: currentPos.x - 1, y: currentPos.y }, 
        { x: currentPos.x + 1, y: currentPos.y }, 
      ];
  
      for (const nextPotentialPos of potentialMoves) {
        
        if (!this.gridService.isWithinBounds(grid, nextPotentialPos)) {
          continue;
        }
  
        //  Checking if cell is safe from bombs or robot-free
        const cellContent = grid[nextPotentialPos.y][nextPotentialPos.x].content;
        const cellRobotId = grid[nextPotentialPos.y][nextPotentialPos.x].robotId;
  
        if (cellContent === CellContentType.BOMB ||
            (cellContent === CellContentType.ROBOT && cellRobotId !== robot.id )) {
          
          if (nextPotentialPos.x === targetPos.x && nextPotentialPos.y === targetPos.y) {
          } else if (cellContent === CellContentType.BOMB || cellContent === CellContentType.ROBOT) {
              continue; // 
          }
        }
  
        // is it possible to minimize the manhattan distance
        const distanceToTargetFromNextPos = this.calculateManhattanDistance(nextPotentialPos, targetPos);
  
        if (distanceToTargetFromNextPos < minDistanceToTarget) {
          minDistanceToTarget = distanceToTargetFromNextPos;
          bestStep = nextPotentialPos;
        }
      }
      
      return bestStep; 
    }
  
  
    /**
     * robot is on a bomb
     */
    public handleBombInteraction(
      robot: BasicRobot,
      
      state: SimulationState, 
    ): void {
      if (!state.grid) {
        console.warn('Grid not available for bomb interaction.');
        return;
      }
      const bombCellPos: Coordinate = { x: robot.x, y: robot.y };
  
      console.log(`Robot ${robot.id} triggered a bomb at (${bombCellPos.x}, ${bombCellPos.y})!`);
      robot.hp = 0; // Robot dies :((
      // robot.assignedTaskId = undefined; // Task (if any) is over
  
      // Clear the bomb from the grid
      if (this.gridService.isWithinBounds(state.grid, bombCellPos)) {
        const cell = state.grid[bombCellPos.y][bombCellPos.x];
        if (cell.content === CellContentType.BOMB) {
          state.grid[bombCellPos.y][bombCellPos.x] = { content: CellContentType.EMPTY, taskId: undefined, robotId: undefined };
        } else {
          
        }
      }
    }
  
    /**
     * Handles interaction when a robot is on a health pack cell.
     */
    public handleHealthPack(
      robot: BasicRobot,
      healthPackTaskId: string, // The ID of the health pack task from state.tasks
      state: SimulationState,
    ): void {
      if (!state.grid || !state.tasks) {
          console.warn('Grid or tasks not available for health pack interaction.');
          return;
      }
  
      const taskIndex = state.tasks.findIndex(
        (task) => task.id === healthPackTaskId && task.type === BasicTaskType.HEALTH_PACK,
      );
  
      if (taskIndex === -1) {
        console.warn(`Health pack task ${healthPackTaskId} not found for robot ${robot.id}`);
        return;
      }
  
      const healthPackTask = state.tasks[taskIndex]; 
  
      console.log(`Robot ${robot.id} consumed health pack ${healthPackTask.id} at (${healthPackTask.x}, ${healthPackTask.y})`);
  
      robot.hp += FIXED_HEALTH_PACK_AMOUNT;
  
      // delete health pack task from the list
      state.tasks.splice(taskIndex, 1);
  
      // Clear health pack from the grid
      // Ensure we are clearing the correct cell based on the task's stored coordinates
      if (this.gridService.isWithinBounds(state.grid, {x: healthPackTask.x, y: healthPackTask.y})) {
        const cell = state.grid[healthPackTask.y][healthPackTask.x];
        // Check if the cell indeed contains this health pack task before clearing
        if (cell.content === CellContentType.HEALTH_PACK && cell.taskId === healthPackTask.id) {
          state.grid[healthPackTask.y][healthPackTask.x] = { content: CellContentType.EMPTY, taskId: undefined, robotId: undefined };
        }
      }
  
    
    }
  
  

    public applyMoveToRobot(
      robot: BasicRobot,
      newPos: Coordinate,
      state: SimulationState
    ): void {
      if (!state.grid) return;
  
      const oldPos: Coordinate = { x: robot.x, y: robot.y };
  

      if (this.gridService.isWithinBounds(state.grid, oldPos)) {
          state.grid[oldPos.y][oldPos.x] = { ...state.grid[oldPos.y][oldPos.x], content: CellContentType.EMPTY, robotId: undefined };
      }
  

      robot.x = newPos.x;
      robot.y = newPos.y;
      robot.hp -= MOVEMENT_HP_COST;
      console.log(`Robot ${robot.id} moved to (${robot.x},${robot.y}). HP: ${robot.hp}. Cost: ${MOVEMENT_HP_COST}`);

      if (this.gridService.isWithinBounds(state.grid, newPos)) {
          if (robot.hp > 0) {
              state.grid[newPos.y][newPos.x] = { ...state.grid[newPos.y][newPos.x], content: CellContentType.ROBOT, robotId: robot.id };
          } else {
  
          }
      }
  
      if (robot.hp <= 0) {
          console.log(`Robot ${robot.id} ran out of HP and "died" at (${robot.x}, ${robot.y}) after moving.`);
         
      }
    }
  }