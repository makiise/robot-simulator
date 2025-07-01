import {
    SimulationState,
    BasicRobot,
    RobotStatus,
    Task,
    TaskType,
    TaskStatus, 
  } from '@/types/common.types';
  
  export class TaskAssignmentService {
    constructor() {
    }
  
  
    private calculateManhattanDistance(
      pos1: { x: number; y: number },
      pos2: { x: number; y: number },
    ): number {
      return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
    }
  
    public assignTaskRoundRobin(state: SimulationState): void {
      if (!state.tasks || !state.robots || state.robots.length === 0) {
        return;
      }
  
      const unassignedTasks = state.tasks.filter(
        (task: Task) => task.status === TaskStatus.UNASSIGNED,
      );
  
      const allRobots = state.robots;
      const robotCount = allRobots.length;
  
      if (unassignedTasks.length === 0 || robotCount === 0) {
        return;
      }
  
      const startIndex = state.currentRoundRobinIndex ?? 0;
  
      for (let i = 0; i < robotCount; i++) {
        const robotIndex = (startIndex + i) % robotCount;
        const robot = allRobots[robotIndex];
  
        if (robot.status !== RobotStatus.IDLE || robot.hp <= 0) {
          continue;
        }
  
        let closestTask: Task | null = null;
        let minDistance = Infinity;
  
        for (const task of unassignedTasks) {
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
          closestTask.status = TaskStatus.ASSIGNED; 
          closestTask.assignedToRobotId = robot.id;
  
          state.currentRoundRobinIndex = (robotIndex + 1) % robotCount;
          return;
        }
      }
    }
  
    public assignTasksNearestRobot(state: SimulationState): void {
      if (!state.tasks || state.tasks.length === 0 || !state.robots || state.robots.length === 0) {
        return;
      }
  
      const availableRobots = state.robots.filter(
        (robot) => robot.status === RobotStatus.IDLE && robot.hp > 0,
      );
  
      const unassignedTasks = state.tasks.filter(
        (task: Task) => task.status === TaskStatus.UNASSIGNED,
      );
  
      if (availableRobots.length === 0 || unassignedTasks.length === 0) {
        return;
      }
  
      for (const task of unassignedTasks) {
        if (task.status === TaskStatus.ASSIGNED) {
            continue;
        }
  
        let bestRobotForTask: BasicRobot | null = null;
        let minDistance = Infinity;
  
        for (const robot of availableRobots) {
          if (robot.assignedTaskId) {
            continue;
          }
          const distance = this.calculateManhattanDistance(robot, task);
          if (distance < minDistance) {
            minDistance = distance;
            bestRobotForTask = robot;
          }
        }
  
        if (bestRobotForTask) {
          console.log(`Assigning task ${task.id} to robot ${bestRobotForTask.id} (Distance: ${minDistance})`);
          bestRobotForTask.assignedTaskId = task.id;
          bestRobotForTask.status = RobotStatus.MOVING_TO_TASK;
          task.status = TaskStatus.ASSIGNED; 
          task.assignedToRobotId = bestRobotForTask.id;
        }
      }
    }
  }