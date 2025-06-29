// src/services/simulation.service.ts
import {
    SimulationState,
    BasicRobot,
    RobotStatus,
    BasicTask,
    CellContentType,
    Coordinate,
  } from '@/types/common.types';
  import { GridService } from './grid.service';
  import { RobotService } from './robot.service';
  import { TaskService } from './task.service';
  
  export class SimulationService {
    private gridService: GridService;
    private robotService: RobotService;
    private taskService: TaskService;
    // private taskAssignmentService: TaskAssignmentService; // will add later
  
    constructor() {
      this.gridService = new GridService();
      this.robotService = new RobotService();
      this.taskService = new TaskService();
      // this.taskAssignmentService = new TaskAssignmentService();
    }
  
    
    public processRobot(robot: BasicRobot, state: SimulationState): void {
      // 1. If robot is already dead, do nothing.
      if (robot.status === RobotStatus.DEAD) {
        return;
      }
  
      // 2. Check if robot has run out of HP from previous actions.
      if (robot.hp <= 0) {
        this.handleRobotDeath(robot, state);
        return;
      }
  
      // 3. If robot has no assigned task, it should be idle.
      if (!robot.assignedTaskId) {
        robot.status = RobotStatus.IDLE;
        return;
      }
  
      // --- Robot has an assigned task, let's process it ---
      const targetTask = state.tasks?.find((t) => t.id === robot.assignedTaskId);
  
      if (!targetTask) {
        console.warn(`Robot ${robot.id} has assigned task ${robot.assignedTaskId}, but task was not found.`);
        robot.assignedTaskId = undefined;
        robot.status = RobotStatus.IDLE;
        return;
      }
  
      const targetPos: Coordinate = { x: targetTask.x, y: targetTask.y };
  
      // 4. Check if robot is already at the target location.
      const isAtTarget = robot.x === targetPos.x && robot.y === targetPos.y;
  
      if (isAtTarget) {
        robot.status = RobotStatus.PERFORMING_TASK;
        console.log(`Robot ${robot.id} is at target task ${targetTask.id}. Performing action.`);
  
        switch (targetTask.type) {
          case 'GARBAGE_BASIC':
            this.taskService.collectGarbage(robot, targetTask.id, state);
            break;
          case 'HEALTH_PACK':
            this.robotService.handleHealthPack(robot, targetTask.id, state);
            break;
          // Add cases for other tasks like PACKAGE later
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
  
    /**
     * Helper function to handle robot "death".
     */
    private handleRobotDeath(robot: BasicRobot, state: SimulationState): void {
      console.log(`Robot ${robot.id} has been marked as DEAD.`);
      robot.status = RobotStatus.DEAD;
      robot.hp = 0; // Ensure HP is not negative
  
      if (state.grid && this.gridService.isWithinBounds(state.grid, robot)) {
        const cell = state.grid[robot.y][robot.x];
        if (cell.robotId === robot.id) {
          cell.content = CellContentType.EMPTY; 
          cell.robotId = undefined;
        }
      }
     
    }
  
    
  }