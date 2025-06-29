import { Request, Response } from 'express';
import { GridService } from '@/services/grid.service';
import {
  GridData,
  BasicRobot,
  RobotStatus,
  BasicTask,
  CellContentType,
  BasicTaskType,
  Coordinate,
} from '@/types/common.types';
import { generateRobotId, generateTaskId, resetIds } from '@/utils/idGenerator'; 

const CERBERUS_BASIC_COST = 100; // Example cost for Day 1 robot

interface SimulationState {
  grid?: GridData;
  robots: BasicRobot[];
  tasks: BasicTask[]; // For actionable tasks like GARBAGE, PACKAGE (not bombss on grid)
  initialBudget?: number;
  currentBudget?: number;
  isRunning: boolean;
  gameStatus: 'SETUP' | 'RUNNING' | 'PAUSED' | 'WON' | 'LOST';
  rows?: number; 
  cols?: number; 
}

let currentSimulationState: SimulationState = {
  robots: [],
  tasks: [],
  isRunning: false,
  gameStatus: 'SETUP',
};

const gridService = new GridService();

export const configureSimulation = (req: Request, res: Response): void => {
  try {
    const { rows, cols, initialBudget } = req.body;

    if (
      typeof rows !== 'number' ||
      typeof cols !== 'number' ||
      typeof initialBudget !== 'number' ||
      rows < 8 || rows > 160 || cols < 8 || cols > 160 || initialBudget < 0
    ) {
      res.status(400).json({ message: 'Invalid input parameters for grid configuration.' });
      return;
    }

    resetIds(); // Reset ID counters for a new simulation
    let grid = gridService.initializeGrid(rows, cols);
    // Bombs are placed on the grid, their 'taskId' is set by placeBombs directly on grid cell
    // They are not added to currentSimulationState.tasks list
    grid = gridService.placeBombs(grid);

    currentSimulationState = {
      grid,
      robots: [],
      tasks: [], // This list is for GARBAGE, PACKAGES etc. Not for bombs that are just grid content.
      initialBudget,
      currentBudget: initialBudget,
      isRunning: false,
      gameStatus: 'SETUP',
      rows: rows, 
      cols: cols, 
    };

    res.status(200).json({
      message: 'Simulation configured successfully.',
      grid: currentSimulationState.grid,
      budget: currentSimulationState.currentBudget,
    });
  } catch (error) {
    console.error('Error configuring simulation:', error);
    res.status(500).json({ message: 'Failed to configure simulation.' });
  }
};

export const getSimulationState = (req: Request, res: Response): void => {
  res.status(200).json(currentSimulationState); //the whole state for now
};

// placeRobotController
export const placeRobotController = (req: Request, res: Response): void => {
  try {
    const { type, x, y } = req.body;
    const targetCell: Coordinate = { x, y };

    
    if (!currentSimulationState.grid || currentSimulationState.gameStatus !== 'SETUP') {
      res.status(400).json({ message: 'Simulation not configured or not in setup phase.' });
      return;
    }

//input validation
    if (type !== 'CERBERUS_BASIC') { // Only one type so faaaar
      res.status(400).json({ message: 'Invalid robot type.' });
      return;
    }
    if (!gridService.isWithinBounds(currentSimulationState.grid, targetCell)) {
      res.status(400).json({ message: 'Placement out of bounds.' });
      return;
    }
    if (currentSimulationState.grid[y][x].content !== CellContentType.EMPTY) {
      res.status(400).json({ message: 'Cell is not empty.' });
      return;
    }
    if ((currentSimulationState.currentBudget ?? 0) < CERBERUS_BASIC_COST) {
      res.status(400).json({ message: 'Insufficient budget.' });
      return;
    }

    // create robot and place it
    
    const newRobotId = generateRobotId();
    
    const newRobot: BasicRobot = {
      id: newRobotId,
      type: 'CERBERUS_BASIC',
      x,
      y,
      hp: 150,
      status: RobotStatus.IDLE, //  new robots start as IDLE
      assignedTaskId: undefined, //new robots have no task
    };

    currentSimulationState.robots.push(newRobot);
    currentSimulationState.grid[y][x] = {
      content: CellContentType.ROBOT,
      robotId: newRobotId,
    };
    currentSimulationState.currentBudget = (currentSimulationState.currentBudget ?? 0) - CERBERUS_BASIC_COST;

    res.status(201).json({
      message: 'Robot placed successfully.',
      robot: newRobot,
      updatedBudget: currentSimulationState.currentBudget,
    });

  } catch (error) {
    console.error('Error placing robot:', error);
    res.status(500).json({ message: 'Failed to place robot.' });
  }
};




export const placeItemController = (req: Request, res: Response): void => {
  try {
    const { type, x, y } = req.body; // might include packageDetails.........
    const targetCell: Coordinate = { x, y };

   
    if (!currentSimulationState.grid || currentSimulationState.gameStatus !== 'SETUP') {
      res.status(400).json({ message: 'Simulation not configured or not in setup phase.' });
      return;
    }

    
    if (type !== BasicTaskType.GARBAGE_BASIC) { // Only GARBAGE_BASIC for now
        res.status(400).json({ message: 'Invalid item type for placement.' });
        return;
    }
    if (!gridService.isWithinBounds(currentSimulationState.grid, targetCell)) {
      res.status(400).json({ message: 'Placement out of bounds.' });
      return;
    }
    if (currentSimulationState.grid[y][x].content !== CellContentType.EMPTY) {
      res.status(400).json({ message: 'Cell is not empty.' });
      return;
    }

    // create and place the item
    const newTaskId = generateTaskId();
    const newItem: BasicTask = {
      id: newTaskId,
      type: BasicTaskType.GARBAGE_BASIC,
      x,
      y,
    };

    currentSimulationState.tasks.push(newItem); // add to the list of actionable tasks
    currentSimulationState.grid[y][x] = {
      content: CellContentType.GARBAGE, // Update grid cell content
      taskId: newTaskId,
    };

    res.status(201).json({
      message: 'Item placed successfully.',
      item: newItem,
    });

  } catch (error) {
    console.error('Error placing item:', error);
    res.status(500).json({ message: 'Failed to place item.' });
  }
};


