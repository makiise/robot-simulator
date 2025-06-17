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
    HEALTH_PACK = 'HEALTH_PACK', // might add this one
    PACKAGE = 'PACKAGE',       // might add this one
  }
  
  export interface GridCell {
    content: CellContentType;
    robotId?: string; // ID of the robot in this cell if there exists any
    taskId?: string;  // taskID att this cell (if there exists any)
    // package destination coordinates might be added later
  }
  
  export type GridData = GridCell[][]; // 2D grid
  
  //robot type
  export interface BasicRobot {
    id: string;
    type: 'CERBERUS_BASIC'; // first type, the strongest robot : cerberus
    x: number;
    y: number;
    hp: number;
    // assignedTaskId?: string; // add later.
  }
  
  //task type
  export enum BasicTaskType {
    BOMB = 'BOMB',
    GARBAGE_BASIC = 'GARBAGE_BASIC',
  }
  
  export interface BasicTask {
    id: string;
    type: BasicTaskType;
    x: number;
    y: number;
    // isCompleted: boolean; // will add later
  }