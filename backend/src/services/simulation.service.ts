import {
    SimulationState,
    BasicRobot, 
    RobotStatus,
    Task,
    TaskType,
    CellContentType,
    Coordinate,
  } from '@/types/common.types';
  import { GridService } from './grid.service';
  import { RobotService } from './robot.service';
  import { TaskService } from './task.service';
  import { TaskAssignmentService } from './taskAssignment.service';
  
  export class SimulationService {
    private gridService: GridService;
    private robotService: RobotService;
    private taskService: TaskService;
    private taskAssignmentService: TaskAssignmentService;
  
    constructor() {
      this.gridService = new GridService();
      this.robotService = new RobotService();
      this.taskService = new TaskService();
      this.taskAssignmentService = new TaskAssignmentService();
    }
  

    public processRobot(robot: BasicRobot, state: SimulationState): void {
      if (robot.status === RobotStatus.DEAD) {
        return;
      }
      if (robot.hp <= 0) {
        this.handleRobotDeath(robot, state);
        return;
      }
      if (!robot.assignedTaskId) {
        robot.status = RobotStatus.IDLE;
        return;
      }
  
      const targetTask = state.tasks?.find((t: Task) => t.id === robot.assignedTaskId);
  
      if (!targetTask) {
        console.warn(`Robot ${robot.id} has assigned task ${robot.assignedTaskId}, but task was not found.`);
        robot.assignedTaskId = undefined;
        robot.status = RobotStatus.IDLE;
        return;
      }
  
      // This logic needs to be updated for Packages later
      const targetPos: Coordinate = { x: targetTask.x, y: targetTask.y };
      const isAtTarget = robot.x === targetPos.x && robot.y === targetPos.y;
  
      if (isAtTarget) {
        robot.status = RobotStatus.PERFORMING_TASK;
        console.log(`Robot ${robot.id} is at target task ${targetTask.id}. Performing action.`);
  
        switch (targetTask.type) {
          case TaskType.GARBAGE:
            this.taskService.collectGarbage(robot, targetTask.id, state);
            break;
          case TaskType.HEALTH_PACK:
            this.robotService.handleHealthPack(robot, targetTask.id, state);
            break;
          // ------------------------------------------
          default:
            console.warn(`Unknown task type ${targetTask.type} for robot ${robot.id} to perform.`);
        }
  
        robot.assignedTaskId = undefined;
        robot.status = RobotStatus.IDLE;
  
        if (robot.hp <= 0) {
          this.handleRobotDeath(robot, state);
        }
      } else {
        robot.status = RobotStatus.MOVING_TO_TASK;
        const nextStep = this.robotService.calculateNextStep(robot, targetPos, state.grid!);
  
        if (nextStep) {
          this.robotService.applyMoveToRobot(robot, nextStep, state);
          if (robot.hp > 0) {
            const newCellContent = state.grid![robot.y][robot.x].content;
            if (newCellContent === CellContentType.BOMB) {
              this.robotService.handleBombInteraction(robot, state);
            }
          }
        } else {
          console.log(`Robot ${robot.id} is blocked and cannot find a next step.`);
          robot.hp -= 1;
          console.log(`Robot ${robot.id} HP is now ${robot.hp} after failed move attempt.`);
        }
      }
    }
  
  
    private handleRobotDeath(robot: BasicRobot, state: SimulationState): void {
      console.log(`Robot ${robot.id} has been marked as DEAD.`);
      robot.status = RobotStatus.DEAD;
      robot.hp = 0;
  
      if (state.grid && this.gridService.isWithinBounds(state.grid, robot)) {
        const cell = state.grid[robot.y][robot.x];
        if (cell.robotId === robot.id) {
          cell.content = CellContentType.EMPTY;
          cell.robotId = undefined;
        }
      }
    }
  
   
    public runTick(state: SimulationState): void {
      if (!state.grid || !state.robots || state.isRunning === false) {
        return;
      }
  
      console.log(`--- Running Tick: ${state.tickCount ?? 0} ---`);
  
      state.robots.forEach(robot => {
          if (robot.hp <= 0 && robot.status !== RobotStatus.DEAD) {
              this.handleRobotDeath(robot, state);
          }
      });
  
      if (state.selectedStrategy === 'ROUND_ROBIN_BASIC') {
        this.taskAssignmentService.assignTaskRoundRobin(state);
      } else {
        this.taskAssignmentService.assignTasksNearestRobot(state);
      }
  
      const livingRobots = state.robots.filter(robot => robot.status !== RobotStatus.DEAD);
      for (const robot of livingRobots) {
        this.processRobot(robot, state);
      }
  
      if (state.tickCount === undefined) {
        state.tickCount = 0;
      }
      state.tickCount++;
  
      const stillLivingRobots = state.robots.filter(robot => robot.status !== RobotStatus.DEAD);
      const remainingTasks = state.tasks?.filter(t => t.type === TaskType.GARBAGE || t.type === TaskType.PACKAGE) ?? [];
  
      if (remainingTasks.length === 0) {
        state.gameStatus = 'WON';
        state.isRunning = false;
        console.log('--- GAME WON! All essential tasks have been completed. ---');
        return;
      }
      if (stillLivingRobots.length === 0 && remainingTasks.length > 0) {
        state.gameStatus = 'LOST';
        state.isRunning = false;
        console.log('--- GAME LOST! All robots have been destroyed. ---');
        return;
      }
    }
  }