import {
    BasicRobot,
    SimulationState,
    BasicTask,
    BasicTaskType,
    CellContentType,
    Coordinate,
  } from '@/types/common.types';
  import { GridService } from './grid.service'; 
  
  const GARBAGE_COLLECTION_HP_COST = 3;
  
  export class TaskService {
    private gridService: GridService;
  
    constructor() {
      this.gridService = new GridService();
    }
  
  
    public collectGarbage(
      robot: BasicRobot,
      garbageTaskId: string,
      state: SimulationState,
    ): boolean { // Return true if collection was successful, false otherwise
      if (!state.grid || !state.tasks) {
        console.warn('Grid or tasks not available for garbage collection.');
        return false;
      }
  
      const taskIndex = state.tasks.findIndex(
        (task: BasicTask) => task.id === garbageTaskId && task.type === BasicTaskType.GARBAGE_BASIC,
      );
  
      if (taskIndex === -1) {
        console.warn(`Garbage task ${garbageTaskId} not found for robot ${robot.id} to collect.`);
        return false;
      }
  
      const garbageTask = state.tasks[taskIndex];
  
      if (robot.x !== garbageTask.x || robot.y !== garbageTask.y) {
        console.warn(
          `Robot ${robot.id} is at (${robot.x},${robot.y}) but tried to collect garbage ${garbageTask.id} at (${garbageTask.x},${garbageTask.y}).`
        );
        return false; // robot is NOT on the cell where TASK IS LOCATED
      }
  
      console.log(
        `Robot ${robot.id} collecting garbage task ${garbageTask.id} at (${garbageTask.x}, ${garbageTask.y})`,
      );
  
      robot.hp -= GARBAGE_COLLECTION_HP_COST;
      console.log(`Robot ${robot.id} HP after collecting garbage: ${robot.hp}. Cost: ${GARBAGE_COLLECTION_HP_COST}`);
  
  
      state.tasks.splice(taskIndex, 1);
  
      const taskPos: Coordinate = { x: garbageTask.x, y: garbageTask.y };
      if (this.gridService.isWithinBounds(state.grid, taskPos)) {
        const cell = state.grid[taskPos.y][taskPos.x];
        if (cell.content === CellContentType.GARBAGE && cell.taskId === garbageTask.id) {
  
          state.grid[taskPos.y][taskPos.x] = {
              ...state.grid[taskPos.y][taskPos.x], 
              content: CellContentType.EMPTY, // garbage is gone
              taskId: undefined,// task on that cell is gone
          };
          // The SimulationService----> will then ensure if robot is alive 
          // its presence is marked. If robot.hp <= 0 after this, the cell might remain empty
          // or the dead robot is removed
        }
      }
  

  
      if (robot.hp <= 0) {
        console.log(`Robot ${robot.id} "died" while collecting garbage.`);
        // Further death processing
      }
      return true; // collection check (pwichka)
    }
  }