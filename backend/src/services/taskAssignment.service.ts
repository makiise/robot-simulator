import {
    SimulationState,
    BasicRobot,
    RobotStatus,
    BasicTask,
    BasicTaskType,
  } from '@/types/common.types';
  // might add gridservice later
  // The RobotService has the distance calculation helper.
  import { RobotService } from './robot.service';
  
  export class TaskAssignmentService {
    private robotService: RobotService;
  
    constructor() {
      this.robotService = new RobotService();
    }


    public assignTaskRoundRobin(state: SimulationState): void {
        if (!state.tasks || !state.robots || state.robots.length === 0) {
          return;
        }
    
        const unassignedGarbageTasks = state.tasks.filter(
          (task) => task.type === BasicTaskType.GARBAGE_BASIC
          // In a more robust system, you'd check task.status
        );
    
        const allRobots = state.robots;
        const robotCount = allRobots.length;
    
        if (unassignedGarbageTasks.length === 0 || robotCount === 0) {
          return; // No tasks to assign or no robots
        }
    
        const startIndex = state.currentRoundRobinIndex ?? 0;
    
        for (let i = 0; i < robotCount; i++) {
          const robotIndex = (startIndex + i) % robotCount;
          const robot = allRobots[robotIndex];
    
          // Check if this robot is available
          if (robot.status !== RobotStatus.IDLE || robot.hp <= 0) {
            continue; // This robot is busy or dead
          }
    
          // we found the next available robot in the sequenc and must find the best task for it.
          let closestTask: BasicTask | null = null;
          let minDistance = Infinity;
    
          for (const task of unassignedGarbageTasks) {
            const distance = this.calculateManhattanDistance(robot, task);
            if (distance < minDistance) {
              minDistance = distance;
              closestTask = task;
            }
          }
    
          if (closestTask) {
            console.log(`Round Robin: Assigning task ${closestTask.id} to robot ${robot.id} (Distance: ${minDistance})`);
    
            robot.assignedTaskId = closestTask.id;
            robot.status = RobotStatus.MOVING_TO_TASK;
    
            const taskIndexInLocalArray = unassignedGarbageTasks.findIndex(t => t.id === closestTask!.id);
            if(taskIndexInLocalArray > -1) {
                unassignedGarbageTasks.splice(taskIndexInLocalArray, 1);
            }
    
            state.currentRoundRobinIndex = (robotIndex + 1) % robotCount;
    
            //assign 1 task per tick in round-robin
            return;
          }
    
          
        }
      }
  
    /**
     * calculate the Manhattan distance 
     */
    private calculateManhattanDistance(
      pos1: { x: number; y: number },
      pos2: { x: number; y: number },
    ): number {
      return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
    }
  
    
     // assigns tasks to the nearest available robot.
    
    public assignTasksNearestRobot(state: SimulationState): void {
      if (!state.tasks || state.tasks.length === 0 || !state.robots || state.robots.length === 0) {
        return; // No tasks to assign or no robots to perform them
      }
  
      // 1. Get lists of available robots and unassigned tasks
      const availableRobots = state.robots.filter(
        (robot) => robot.status === RobotStatus.IDLE && robot.hp > 0,
      );
  
      // 
      const assignedTaskIdsThisTick = new Set<string>();
  
      const unassignedGarbageTasks = state.tasks.filter(
          (task) => task.type === BasicTaskType.GARBAGE_BASIC
      );
  
      if (availableRobots.length === 0 || unassignedGarbageTasks.length === 0) {
        return; //
      }
  //iterating through tasks
      for (const task of unassignedGarbageTasks) {
        let bestRobotForTask: BasicRobot | null = null;
        let minDistance = Infinity;
  
        for (const robot of availableRobots) {
          // Ensure this robot is still available (hasn't been assigned another task this tick)
          if (robot.assignedTaskId) {
              continue;
          }
  
          const distance = this.calculateManhattanDistance(robot, task);
  
          if (distance < minDistance) {
            minDistance = distance;
            bestRobotForTask = robot;
          }
        }
  
        // If we found a suitable robot for this task, assign it.
        if (bestRobotForTask) {
          console.log(`Assigning task ${task.id} to robot ${bestRobotForTask.id} (Distance: ${minDistance})`);
  
          // Assign the task to the robot
          bestRobotForTask.assignedTaskId = task.id;
          bestRobotForTask.status = RobotStatus.MOVING_TO_TASK;
  
          // mark the robot as "taken" for this tick so they aren't considered again
        }
      }
    }
  }