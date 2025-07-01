// src/services/taskAssignment.service.test.ts
import { TaskAssignmentService } from './taskAssignment.service';
import {
  SimulationState,
  BasicRobot,
  RobotStatus,
  BasicTask,
  BasicTaskType,
} from '@/types/common.types';

describe('TaskAssignmentService', () => {
  let taskAssignmentService: TaskAssignmentService;
  let mockState: SimulationState;

  beforeEach(() => {
    taskAssignmentService = new TaskAssignmentService();
  });

  describe('assignTasksNearestRobot', () => {
    it('should assign a task to the closest idle robot', () => {
      // Arrange
      const robotFar: BasicRobot = {
        id: 'robot-far', type: 'CERBERUS_BASIC', x: 10, y: 10, hp: 100,
        initialHp: 100, // <<< FIX
        status: RobotStatus.IDLE, assignedTaskId: undefined,
      };
      const robotClose: BasicRobot = {
        id: 'robot-close', type: 'CERBERUS_BASIC', x: 1, y: 1, hp: 100,
        initialHp: 100, // <<< FIX
        status: RobotStatus.IDLE, assignedTaskId: undefined,
      };
      const garbageTask: BasicTask = {
        id: 'task-1', type: BasicTaskType.GARBAGE_BASIC, x: 0, y: 0,
      };

      mockState = {
        robots: [robotFar, robotClose],
        tasks: [garbageTask],
        gameStatus: 'RUNNING',
        isRunning: true,
      };

      // Act
      taskAssignmentService.assignTasksNearestRobot(mockState);

      // Assert
      expect(robotClose.assignedTaskId).toBe('task-1');
      expect(robotClose.status).toBe(RobotStatus.MOVING_TO_TASK);
      expect(robotFar.assignedTaskId).toBeUndefined();
      expect(robotFar.status).toBe(RobotStatus.IDLE);
    });

    it('should not assign a task to a busy robot, even if it is closer', () => {
      // Arrange
      const robotBusy: BasicRobot = {
        id: 'robot-busy', type: 'CERBERUS_BASIC', x: 1, y: 1, hp: 100,
        initialHp: 100, // <<< FIX
        status: RobotStatus.MOVING_TO_TASK, assignedTaskId: 'some-other-task',
      };
      const robotAvailable: BasicRobot = {
        id: 'robot-available', type: 'CERBERUS_BASIC', x: 10, y: 10, hp: 100,
        initialHp: 100, // <<< FIX
        status: RobotStatus.IDLE, assignedTaskId: undefined,
      };
      const garbageTask: BasicTask = {
        id: 'task-1', type: BasicTaskType.GARBAGE_BASIC, x: 0, y: 0,
      };

      mockState = {
        robots: [robotBusy, robotAvailable],
        tasks: [garbageTask],
        gameStatus: 'RUNNING', isRunning: true,
      };

      // Act
      taskAssignmentService.assignTasksNearestRobot(mockState);

      // Assert
      expect(robotAvailable.assignedTaskId).toBe('task-1');
      expect(robotBusy.assignedTaskId).toBe('some-other-task'); // Unchanged
    });

    it('should assign multiple tasks to multiple robots in one tick', () => {
        // Arrange
        const robotA: BasicRobot = {
            id: 'robot-A', type: 'CERBERUS_BASIC', x: 0, y: 0, hp: 100,
            initialHp: 100, // <<< FIX
            status: RobotStatus.IDLE, assignedTaskId: undefined,
        };
        const robotB: BasicRobot = {
            id: 'robot-B', type: 'CERBERUS_BASIC', x: 10, y: 10, hp: 100,
            initialHp: 100, // <<< FIX
            status: RobotStatus.IDLE, assignedTaskId: undefined,
        };
        const taskA: BasicTask = {
            id: 'task-A', type: BasicTaskType.GARBAGE_BASIC, x: 1, y: 1,
        };
        const taskB: BasicTask = {
            id: 'task-B', type: BasicTaskType.GARBAGE_BASIC, x: 11, y: 11,
        };

        mockState = {
            robots: [robotA, robotB],
            tasks: [taskA, taskB],
            gameStatus: 'RUNNING', isRunning: true,
        };

        // Act
        taskAssignmentService.assignTasksNearestRobot(mockState);

        // Assert
        expect(robotA.assignedTaskId).toBe('task-A');
        expect(robotB.assignedTaskId).toBe('task-B');
    });
  });

  // You can add tests for assignTaskRoundRobin here as well
  describe('assignTaskRoundRobin', () => {
    it('should assign a task to the first idle robot in sequence', () => {
        // Arrange
        const robotA: BasicRobot = {
            id: 'robot-A', type: 'CERBERUS_BASIC', x: 0, y: 0, hp: 100,
            initialHp: 100, // <<< FIX
            status: RobotStatus.IDLE, assignedTaskId: undefined,
        };
        const robotB: BasicRobot = {
            id: 'robot-B', type: 'CERBERUS_BASIC', x: 10, y: 10, hp: 100,
            initialHp: 100, // <<< FIX
            status: RobotStatus.IDLE, assignedTaskId: undefined,
        };
        const taskA: BasicTask = {
            id: 'task-A', type: BasicTaskType.GARBAGE_BASIC, x: 5, y: 5,
        };

        mockState = {
            robots: [robotA, robotB],
            tasks: [taskA],
            gameStatus: 'RUNNING', isRunning: true,
            currentRoundRobinIndex: 0, // Start from the beginning
        };

        // Act
        taskAssignmentService.assignTaskRoundRobin(mockState);

        // Assert
        expect(robotA.assignedTaskId).toBe('task-A');
        expect(robotB.assignedTaskId).toBeUndefined();
        expect(mockState.currentRoundRobinIndex).toBe(1); // Index should advance to next robot
    });
  });
});