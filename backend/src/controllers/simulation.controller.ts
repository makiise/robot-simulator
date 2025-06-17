import { Request, Response } from 'express';
import { GridService } from '@/services/grid.service';
import { GridData, BasicRobot, BasicTask } from '@/types/common.types'; // my types

// instead of multiple users, for this project, a single in-memory state is fine for now
interface SimulationState {
  grid?: GridData;
  robots: BasicRobot[];
  tasks: BasicTask[];
  initialBudget?: number;
  currentBudget?: number;
  isRunning: boolean;
  gameStatus: 'SETUP' | 'RUNNING' | 'PAUSED' | 'WON' | 'LOST';
  // more state properties later
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

    if (typeof rows !== 'number' || typeof cols !== 'number' || typeof initialBudget !== 'number' ||
        rows < 8 || rows > 160 || cols < 8 || cols > 160 || initialBudget < 0) {
      res.status(400).json({ message: 'Invalid input parameters for grid configuration.' });
      return;
    }

    let grid = gridService.initializeGrid(rows, cols);
    grid = gridService.placeBombs(grid); // Default 3 bombs

    // Reseting state for a new configuration
    currentSimulationState = {
      grid,
      robots: [],
      tasks: [], 
      initialBudget,
      currentBudget: initialBudget,
      isRunning: false,
      gameStatus: 'SETUP',
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

// Placeholder for getting state - FRONTEND WILL NEED THIS
export const getSimulationState = (req: Request, res: Response): void => {
    
    res.status(200).json({
        grid: currentSimulationState.grid,
        robots: currentSimulationState.robots,
        tasks: currentSimulationState.tasks, // empty for now
        budget: currentSimulationState.currentBudget,
        gameStatus: currentSimulationState.gameStatus,
        isRunning: currentSimulationState.isRunning,
        // frontend might need other relevant state properties..........
    });
};

// placeRobot and placeItem for tomorrow...............