
export interface Coordinate {
  x: number;
  y: number;
}

export enum CellContentType {
  EMPTY = 'EMPTY',
  ROBOT = 'ROBOT',
  BOMB = 'BOMB',
  GARBAGE = 'GARBAGE',
  HEALTH_PACK = 'HEALTH_PACK',
  PACKAGE = 'PACKAGE', 
}

export interface GridCell {
  content: CellContentType;
  robotId?: string;
  taskId?: string;
}

export type GridData = GridCell[][];

// --- Robot Types ---

export type RobotType = 'CERBERUS_BASIC' | 'JESUS_OF_SUBURBIA' | 'CALCIFER';

export enum RobotStatus {
  IDLE = 'IDLE',
  MOVING_TO_TASK = 'MOVING_TO_TASK',
  PERFORMING_TASK = 'PERFORMING_TASK',
  DEAD = 'DEAD',
}

export interface BasicRobot {
  id: string;
  type: RobotType;
  x: number;
  y: number;
  hp: number;
  initialHp: number;
  status: RobotStatus;
  assignedTaskId?: string;
  movementZone?: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
  carryingPackageId?: string; 
}



export enum TaskType {
  GARBAGE = 'GARBAGE',
  PACKAGE = 'PACKAGE',
  HEALTH_PACK = 'HEALTH_PACK',
}

export enum TaskStatus {
  UNASSIGNED = 'UNASSIGNED',
  ASSIGNED = 'ASSIGNED',
  IN_TRANSIT = 'IN_TRANSIT', // For packages
}

export type PackageSize = 'SMALL' | 'MEDIUM' | 'BIG';

export interface Task {
id: string;
type: TaskType;
x: number;
y: number;
status: TaskStatus; 
assignedToRobotId?: string;

packageDetails?: {
  size: PackageSize;
  destination: Coordinate;
  pickupHpCost: number;
};

garbageDetails?: {
  respawnTimer: number;
  isCollected: boolean;
};
}


export interface SimulationState {
  grid?: GridData;
  robots: BasicRobot[];
  tasks: Task[]; 
  initialBudget?: number;
  currentBudget?: number;
  isRunning: boolean;
  gameStatus: 'SETUP' | 'RUNNING' | 'PAUSED' | 'WON' | 'LOST';
  rows?: number;
  cols?: number;
  selectedStrategy?: 'NEAREST_ROBOT_BASIC' | 'ROUND_ROBIN_BASIC';
  currentRoundRobinIndex?: number;
  tickCount?: number;
  speedMultiplier?: number;
}