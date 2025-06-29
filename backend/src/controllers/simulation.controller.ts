// src/controllers/simulation.controller.ts
import { Request, Response } from 'express';
import { GridService } from '@/services/grid.service';
import { SimulationService } from '@/services/simulation.service';
import {
  GridData,
  BasicRobot,
  RobotStatus,
  BasicTask,
  CellContentType,
  BasicTaskType,
  Coordinate,
  SimulationState, // <<< IMPORT THIS FROM common.types.ts
} from '@/types/common.types';
import { generateRobotId, generateTaskId, resetIds } from '@/utils/idGenerator';

// --- Constants ---
const CERBERUS_BASIC_COST = 100;

// --- Module-level State and Services (Declare these at the top) ---
const gridService = new GridService();
const simulationService = new SimulationService();
let simulationInterval: NodeJS.Timeout | null = null;

let currentSimulationState: SimulationState = {
  robots: [],
  tasks: [],
  isRunning: false,
  gameStatus: 'SETUP',
  currentRoundRobinIndex: 0,
  tickCount: 0,
};

// ====================================================================
// --- Controller Functions ---
// ====================================================================

export const configureSimulation = (req: Request, res: Response): void => {
  try {
    const { rows, cols, initialBudget } = req.body;

    if (
      typeof rows !== 'number' || typeof cols !== 'number' || typeof initialBudget !== 'number' ||
      rows < 8 || rows > 160 || cols < 8 || cols > 160 || initialBudget < 0
    ) {
      res.status(400).json({ message: 'Invalid input parameters for grid configuration.' });
      return;
    }

    // Stop any potentially running simulation before re-configuring
    if (simulationInterval) {
        clearInterval(simulationInterval);
        simulationInterval = null;
    }

    resetIds();
    let grid = gridService.initializeGrid(rows, cols);
    grid = gridService.placeBombs(grid);

    currentSimulationState = {
      grid,
      robots: [],
      tasks: [],
      initialBudget,
      currentBudget: initialBudget,
      isRunning: false,
      gameStatus: 'SETUP',
      rows: rows,
      cols: cols,
      currentRoundRobinIndex: 0,
      tickCount: 0,
      selectedStrategy: undefined,
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
  res.status(200).json(currentSimulationState);
};

export const placeRobotController = (req: Request, res: Response): void => {
  try {
    const { type, x, y } = req.body;
    const targetCell: Coordinate = { x, y };

    if (!currentSimulationState.grid || currentSimulationState.gameStatus !== 'SETUP') {
      res.status(400).json({ message: 'Simulation not configured or not in setup phase.' });
      return;
    }
    if (type !== 'CERBERUS_BASIC' && type !== 'JESUS_OF_SUBURBIA' && type !== 'CALCIFER') {
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

    const newRobotId = generateRobotId();
    const newRobot: BasicRobot = {
      id: newRobotId,
      type: 'CERBERUS_BASIC', // This can be replaced with `type` from req.body when you support more
      x,
      y,
      hp: 150,
      status: RobotStatus.IDLE,
      assignedTaskId: undefined,
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
    const { type, x, y } = req.body;
    const targetCell: Coordinate = { x, y };

    if (!currentSimulationState.grid || currentSimulationState.gameStatus !== 'SETUP') {
      res.status(400).json({ message: 'Simulation not configured or not in setup phase.' });
      return;
    }
    if (type !== BasicTaskType.GARBAGE_BASIC && type !== BasicTaskType.HEALTH_PACK) { // Allow placing health packs
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

    const newTaskId = generateTaskId();
    const newItem: BasicTask = {
      id: newTaskId,
      type: type as BasicTaskType, // Cast type from body
      x,
      y,
    };
    
    currentSimulationState.tasks.push(newItem);
    // Use a mapping for content type if needed
    const contentType = type === BasicTaskType.GARBAGE_BASIC ? CellContentType.GARBAGE : CellContentType.HEALTH_PACK;
    currentSimulationState.grid[y][x] = {
      content: contentType,
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


export const startSimulationController = (req: Request, res: Response): void => {
  try {
      const { strategy } = req.body;
      const previousGameStatus = currentSimulationState.gameStatus; // Capture state BEFORE changes

      if (previousGameStatus !== 'SETUP' && previousGameStatus !== 'PAUSED') {
          res.status(400).json({ message: 'Simulation is already running or has ended.' });
          return;
      }

      const effectiveStrategy = strategy || currentSimulationState.selectedStrategy;
      if (!effectiveStrategy || (effectiveStrategy !== 'NEAREST_ROBOT_BASIC' && effectiveStrategy !== 'ROUND_ROBIN_BASIC')) {
          res.status(400).json({ message: `A valid strategy must be selected. Received: ${strategy}` });
          return;
      }

     
      // If starting fresh (from SETUP), reset the tick count.
      // If resuming (from PAUSED), DO NOT reset the tick count.
      if (previousGameStatus === 'SETUP') {
          currentSimulationState.tickCount = 0;
      }
      // ------------------------------------

      // Now, update the state to running
      currentSimulationState.isRunning = true;
      currentSimulationState.gameStatus = 'RUNNING';
      currentSimulationState.selectedStrategy = effectiveStrategy;


      if (simulationInterval) clearInterval(simulationInterval);

      const tickRate = 1000; // 1 tick per second
      simulationInterval = setInterval(() => {
          simulationService.runTick(currentSimulationState);

          if (currentSimulationState.isRunning === false) { // runTick sets this to false on win/loss
              if (simulationInterval) clearInterval(simulationInterval);
              simulationInterval = null;
              console.log('Simulation interval stopped due to game end.');
          }
      }, tickRate);

      console.log(`Simulation started/resumed with strategy: ${effectiveStrategy}`);
      res.status(200).json({ message: 'Simulation started.' });

  } catch (error) {
      console.error('Error starting simulation:', error);
      res.status(500).json({ message: 'Failed to start simulation.' });
  }
};

export const controlSimulationController = (req: Request, res: Response): void => {
    const { action } = req.body;

    switch (action) {
        case 'PAUSE':
            if (simulationInterval) {
                clearInterval(simulationInterval);
                simulationInterval = null;
                currentSimulationState.isRunning = false;
                currentSimulationState.gameStatus = 'PAUSED';
                console.log('Simulation paused.');
                res.status(200).json({ message: 'Simulation paused.' });
            } else {
                res.status(400).json({ message: 'Simulation is not running, cannot pause.' });
            }
            break;
        case 'RESUME':
            if (currentSimulationState.gameStatus === 'PAUSED') {
                // Call start controller to resume. It has the logic to restart the interval.
                startSimulationController(req, res);
            } else {
                res.status(400).json({ message: 'Simulation is not paused.' });
            }
            break;
        case 'RESET':
            if (simulationInterval) {
                clearInterval(simulationInterval);
                simulationInterval = null;
            }
            // Reset state to initial empty setup
            currentSimulationState = {
                robots: [],
                tasks: [],
                isRunning: false,
                gameStatus: 'SETUP',
                currentRoundRobinIndex: 0,
                tickCount: 0,
            };
            resetIds();
            console.log('Simulation state has been reset.');
            res.status(200).json({ message: 'Simulation reset. Please configure the grid again.' });
            break;
        default:
            res.status(400).json({ message: 'Invalid control action.' });
    }
};