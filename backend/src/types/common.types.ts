export interface Coordinate {
    x: number;
    y: number;
  }
  
  // what a cell can primarily contain
  export enum CellContentType {
    EMPTY = 'EMPTY',
    ROBOT = 'ROBOT',
    BOMB = 'BOMB',
    GARBAGE = 'GARBAGE',
    HEALTH_PACK = 'HEALTH_PACK', 
    PACKAGE = 'PACKAGE',       // might add this one
  }
  export interface SimulationState { 
    grid?: GridData;
    robots: BasicRobot[];
    tasks: BasicTask[]; // for garbage, health_points, package
    initialBudget?: number;
    currentBudget?: number;
    isRunning: boolean;
    gameStatus: 'SETUP' | 'RUNNING' | 'PAUSED' | 'WON' | 'LOST';
    rows?: number;
    cols?: number;
    selectedStrategy?: 'NEAREST_ROBOT_BASIC' | 'ROUND_ROBIN_BASIC'; 
    currentRoundRobinIndex?: number; // for round robin
    tickCount?: number; 
  }
  export interface GridCell {
    content: CellContentType;
    robotId?: string; // ID of the robot in this cell if there exists any
    taskId?: string;  // taskID att this cell (if there exists any)
    // package destination coordinates might be added
  }
  
  export type GridData = GridCell[][]; // 2D grid
  
  //robot type
  export interface BasicRobot {
    id: string;
    type: 'CERBERUS_BASIC' | 'JESUS_OF_SUBURBIA' | 'CALCIFER'; //
    x: number;
    y: number;
    hp: number;
    status: RobotStatus;
    assignedTaskId?: string;
  }

  export enum RobotStatus {
    IDLE = 'IDLE',
    MOVING_TO_TASK = 'MOVING_TO_TASK',
    PERFORMING_TASK = 'PERFORMING_TASK', 
    DEAD = 'DEAD',
  }
  
  //task type
  export enum BasicTaskType {
    BOMB = 'BOMB',
    GARBAGE_BASIC = 'GARBAGE_BASIC',
    HEALTH_PACK = 'HEALTH_PACK', 
    PACKAGE_BASIC = 'PACKAGE_BASIC', // if I add packages
  }
  
  export interface BasicTask {
    id: string;
    type: BasicTaskType;
    x: number;
    y: number;
    // isCompleted: boolean; // will add later
  }