import { Request, Response } from 'express';
import { ROBOT_SPECS, JOS_ZONE_RADIUS } from '@/config/game.config';
import { RobotType } from '@/types/common.types'; 
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
  SimulationState,
} from '@/types/common.types';
import { generateRobotId, generateTaskId, resetIds } from '@/utils/idGenerator';

const BASE_TICK_RATE = 1000; 

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
  speedMultiplier: 1, 
};


export const configureSimulation = (req: Request, res: Response) => {
  try {
    const { rows, cols, initialBudget } = req.body;

    if (
      typeof rows !== 'number' || typeof cols !== 'number' || typeof initialBudget !== 'number' ||
      rows < 8 || rows > 160 || cols < 8 || cols > 160 || initialBudget < 0
    ) {
      res.status(400).json({ message: 'Invalid input parameters for grid configuration.' });
      return;
    }

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
      speedMultiplier: 1, 
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

export const getSimulationState = (req: Request, res: Response) => {
  res.status(200).json(currentSimulationState);
};

export const placeRobotController = (req: Request, res: Response) => {
  try {
    const { type, x, y } = req.body as { type: RobotType; x: number; y: number };
    const targetCell: Coordinate = { x, y };

    if (!currentSimulationState.grid || currentSimulationState.gameStatus !== 'SETUP') {
      res.status(400).json({ message: 'Simulation not configured or not in setup phase.' });
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

    const spec = ROBOT_SPECS[type];
    if (!spec) {
      res.status(400).json({ message: 'Invalid robot type provided.' });
      return;
    }

    if ((currentSimulationState.currentBudget ?? 0) < spec.cost) {
      res.status(400).json({ message: 'Insufficient budget for this robot type.' });
      return;
    }

    const newRobotId = generateRobotId();
    const newRobot: BasicRobot = {
      id: newRobotId,
      type: type, 
      x,
      y,
      hp: spec.initialHp,        
      initialHp: spec.initialHp,
      status: RobotStatus.IDLE,
      assignedTaskId: undefined,
      carryingPackageId: undefined,
    };

    if (type === 'JESUS_OF_SUBURBIA') {
      const gridRows = currentSimulationState.rows ?? 0;
      const gridCols = currentSimulationState.cols ?? 0;
      newRobot.movementZone = {
        minX: Math.max(0, x - JOS_ZONE_RADIUS),
        maxX: Math.min(gridCols - 1, x + JOS_ZONE_RADIUS),
        minY: Math.max(0, y - JOS_ZONE_RADIUS),
        maxY: Math.min(gridRows - 1, y + JOS_ZONE_RADIUS),
      };
    }

    currentSimulationState.robots.push(newRobot);
    currentSimulationState.grid[y][x] = {
      content: CellContentType.ROBOT,
      robotId: newRobotId,
    };
    currentSimulationState.currentBudget = (currentSimulationState.currentBudget ?? 0) - spec.cost;

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


export const placeItemController = (req: Request, res: Response) => {
  try {
    const { type, x, y } = req.body;
    const targetCell: Coordinate = { x, y };

    if (!currentSimulationState.grid || currentSimulationState.gameStatus !== 'SETUP') {
      res.status(400).json({ message: 'Simulation not configured or not in setup phase.' });
      return;
    }
    if (type !== BasicTaskType.GARBAGE_BASIC && type !== BasicTaskType.HEALTH_PACK) {
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
      type: type as BasicTaskType,
      x,
      y,
    };
    
    currentSimulationState.tasks.push(newItem);
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


export const startSimulationController = (req: Request, res: Response) => {
  try {
      const { strategy } = req.body;
      const previousGameStatus = currentSimulationState.gameStatus;

      if (previousGameStatus !== 'SETUP' && previousGameStatus !== 'PAUSED') {
          res.status(400).json({ message: 'Simulation is already running or has ended.' });
          return;
      }

      const effectiveStrategy = strategy || currentSimulationState.selectedStrategy;
      if (!effectiveStrategy || (effectiveStrategy !== 'NEAREST_ROBOT_BASIC' && effectiveStrategy !== 'ROUND_ROBIN_BASIC')) {
          res.status(400).json({ message: `A valid strategy must be selected. Received: ${strategy}` });
          return;
      }

      if (previousGameStatus === 'SETUP') {
          currentSimulationState.tickCount = 0;
      }

      currentSimulationState.isRunning = true;
      currentSimulationState.gameStatus = 'RUNNING';
      currentSimulationState.selectedStrategy = effectiveStrategy;
      if (currentSimulationState.speedMultiplier === undefined) {
          currentSimulationState.speedMultiplier = 1;
      }


      if (simulationInterval) clearInterval(simulationInterval);

      const tickRate = BASE_TICK_RATE / currentSimulationState.speedMultiplier;

      simulationInterval = setInterval(() => {
          simulationService.runTick(currentSimulationState);

          if (currentSimulationState.isRunning === false) {
              if (simulationInterval) clearInterval(simulationInterval);
              simulationInterval = null;
              console.log('Simulation interval stopped due to game end.');
          }
      }, tickRate);

      console.log(`Simulation started/resumed with strategy: ${effectiveStrategy} at speed ${currentSimulationState.speedMultiplier}x`);
      res.status(200).json({ message: 'Simulation started.' });

  } catch (error) {
      console.error('Error starting simulation:', error);
      res.status(500).json({ message: 'Failed to start simulation.' });
  }
};

export const controlSimulationController = (req: Request, res: Response) => {
    const { action, speedValue } = req.body; 

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
            currentSimulationState = {
                robots: [],
                tasks: [],
                isRunning: false,
                gameStatus: 'SETUP',
                currentRoundRobinIndex: 0,
                tickCount: 0,
                speedMultiplier: 1, 
            };
            resetIds();
            console.log('Simulation state has been reset.');
            res.status(200).json({ message: 'Simulation reset. Please configure the grid again.' });
            break;

        case 'SET_SPEED':
            if (typeof speedValue !== 'number' || speedValue <= 0) {
                res.status(400).json({ message: 'Invalid speed value. Must be a positive number.' });
                return;
            }

            console.log(`Setting simulation speed to ${speedValue}x`);
            currentSimulationState.speedMultiplier = speedValue;

            if (currentSimulationState.isRunning && simulationInterval) {
                clearInterval(simulationInterval); 
                
                const newTickRate = BASE_TICK_RATE / currentSimulationState.speedMultiplier;
                
                simulationInterval = setInterval(() => { 
                    simulationService.runTick(currentSimulationState);
                    if (currentSimulationState.isRunning === false) {
                        if (simulationInterval) clearInterval(simulationInterval);
                        simulationInterval = null;
                    }
                }, newTickRate);
            }
            res.status(200).json({ message: `Speed set to ${speedValue}x`, newSpeed: speedValue });
            break;

        default:
            res.status(400).json({ message: 'Invalid control action.' });
    }
};