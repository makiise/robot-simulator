import { TaskAssignmentService } from './taskAssignment.service';
import {
  SimulationState,
  BasicRobot,
  RobotStatus,
  Task,       
  TaskType,   
  TaskStatus, 
} from '@/types/common.types';

describe('TaskAssignmentService', () => {
  let taskAssignmentService: TaskAssignmentService;
  let mockState: SimulationState;

  beforeEach(() => {
    taskAssignmentService = new TaskAssignmentService();
  });

  describe('assignTasksNearestRobot', () => {
    it('should assign a task to the closest idle robot', () => {
      const robotFar: BasicRobot = {
        id: 'robot-far', type: 'CERBERUS_BASIC', x: 10, y: 10, hp: 100,
        initialHp: 100, status: RobotStatus.IDLE,
      };
      const robotClose: BasicRobot = {
        id: 'robot-close', type: 'CERBERUS_BASIC', x: 1, y: 1, hp: 100,
        initialHp: 100, status: RobotStatus.IDLE,
      };
      const garbageTask: Task = { 
        id: 'task-1', type: TaskType.GARBAGE, x: 0, y: 0, 
        status: TaskStatus.UNASSIGNED, 
      };

      mockState = {
        robots: [robotFar, robotClose],
        tasks: [garbageTask],
        gameStatus: 'RUNNING', isRunning: true,
      };

      taskAssignmentService.assignTasksNearestRobot(mockState);

      expect(robotClose.assignedTaskId).toBe('task-1');
      expect(robotClose.status).toBe(RobotStatus.MOVING_TO_TASK);
      expect(robotFar.assignedTaskId).toBeUndefined();
      expect(robotFar.status).toBe(RobotStatus.IDLE);
    });

    it('should not assign a task to a busy robot, even if it is closer', () => {
      const robotBusy: BasicRobot = {
        id: 'robot-busy', type: 'CERBERUS_BASIC', x: 1, y: 1, hp: 100,
        initialHp: 100, status: RobotStatus.MOVING_TO_TASK, assignedTaskId: 'some-other-task',
      };
      const robotAvailable: BasicRobot = {
        id: 'robot-available', type: 'CERBERUS_BASIC', x: 10, y: 10, hp: 100,
        initialHp: 100, status: RobotStatus.IDLE,
      };
      const garbageTask: Task = { 
        id: 'task-1', type: TaskType.GARBAGE, x: 0, y: 0, status: TaskStatus.UNASSIGNED, 
      };

      mockState = {
        robots: [robotBusy, robotAvailable],
        tasks: [garbageTask],
        gameStatus: 'RUNNING', isRunning: true,
      };

      taskAssignmentService.assignTasksNearestRobot(mockState);

      expect(robotAvailable.assignedTaskId).toBe('task-1');
      expect(robotBusy.assignedTaskId).toBe('some-other-task');
    });

    it('should assign multiple tasks to multiple robots in one tick', () => {
        const robotA: BasicRobot = {
            id: 'robot-A', type: 'CERBERUS_BASIC', x: 0, y: 0, hp: 100,
            initialHp: 100, status: RobotStatus.IDLE,
        };
        const robotB: BasicRobot = {
            id: 'robot-B', type: 'CERBERUS_BASIC', x: 10, y: 10, hp: 100,
            initialHp: 100, status: RobotStatus.IDLE,
        };
        const taskA: Task = { 
            id: 'task-A', type: TaskType.GARBAGE, x: 1, y: 1, status: TaskStatus.UNASSIGNED, 
        };
        const taskB: Task = { 
            id: 'task-B', type: TaskType.GARBAGE, x: 11, y: 11, status: TaskStatus.UNASSIGNED, 
        };

        mockState = {
            robots: [robotA, robotB],
            tasks: [taskA, taskB],
            gameStatus: 'RUNNING', isRunning: true,
        };

        taskAssignmentService.assignTasksNearestRobot(mockState);

        expect(robotA.assignedTaskId).toBe('task-A');
        expect(robotB.assignedTaskId).toBe('task-B');
    });
  });

  describe('assignTaskRoundRobin', () => {
    it('should assign a task to the first idle robot in sequence', () => {
        const robotA: BasicRobot = {
            id: 'robot-A', type: 'CERBERUS_BASIC', x: 0, y: 0, hp: 100,
            initialHp: 100, status: RobotStatus.IDLE,
        };
        const robotB: BasicRobot = {
            id: 'robot-B', type: 'CERBERUS_BASIC', x: 10, y: 10, hp: 100,
            initialHp: 100, status: RobotStatus.IDLE,
        };
        const taskA: Task = { 
            id: 'task-A', type: TaskType.GARBAGE, x: 5, y: 5, status: TaskStatus.UNASSIGNED,
        };

        mockState = {
            robots: [robotA, robotB],
            tasks: [taskA],
            gameStatus: 'RUNNING', isRunning: true,
            currentRoundRobinIndex: 0,
        };

        taskAssignmentService.assignTaskRoundRobin(mockState);

        expect(robotA.assignedTaskId).toBe('task-A');
        expect(robotB.assignedTaskId).toBeUndefined();
        expect(mockState.currentRoundRobinIndex).toBe(1);
    });
  });
});