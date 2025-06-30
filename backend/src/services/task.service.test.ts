// src/services/task.service.test.ts
import { TaskService } from './task.service';
import {
  SimulationState,
  BasicRobot,
  RobotStatus,
  BasicTask,
  BasicTaskType,
  CellContentType,
} from '@/types/common.types';

// Mock the GridService since we don't need its real implementation here
jest.mock('./grid.service', () => {
  return {
    GridService: jest.fn().mockImplementation(() => {
      return { isWithinBounds: () => true }; // Assume all coordinates are always in bounds for this test
    }),
  };
});

describe('TaskService', () => {
  let taskService: TaskService;
  let mockState: SimulationState;
  let mockRobot: BasicRobot;
  let mockGarbageTask: BasicTask;

  beforeEach(() => {
    taskService = new TaskService();

    // Set up a robot ready to collect garbage
    mockRobot = {
      id: 'robot-1',
      type: 'CERBERUS_BASIC',
      x: 3,
      y: 3,
      hp: 100,
      status: RobotStatus.PERFORMING_TASK,
      assignedTaskId: 'task-garbage-1',
    };

    // Set up the garbage task at the same location as the robot
    mockGarbageTask = {
      id: 'task-garbage-1',
      type: BasicTaskType.GARBAGE_BASIC,
      x: 3,
      y: 3,
    };

    // Set up a mock simulation state
    mockState = {
      robots: [mockRobot],
      tasks: [mockGarbageTask],
      grid: Array(5).fill(null).map(() =>
        Array(5).fill(null).map(() => ({ content: CellContentType.EMPTY }))
      ),
      gameStatus: 'RUNNING',
      isRunning: true,
    };

    // Place the garbage on the mock grid for accuracy
    if (mockState.grid) {
      mockState.grid[3][3] = {
        content: CellContentType.GARBAGE,
        taskId: 'task-garbage-1',
      };
    }
  });

  it('should deduct HP from the robot when collecting garbage', () => {
    const initialHp = mockRobot.hp;
    const GARBAGE_COLLECTION_HP_COST = 3;

    taskService.collectGarbage(mockRobot, 'task-garbage-1', mockState);

    expect(mockRobot.hp).toBe(initialHp - GARBAGE_COLLECTION_HP_COST);
  });

  it('should remove the garbage task from the state.tasks array', () => {
    expect(mockState.tasks).toHaveLength(1);
    expect(mockState.tasks[0].id).toBe('task-garbage-1');

    taskService.collectGarbage(mockRobot, 'task-garbage-1', mockState);

    expect(mockState.tasks).toHaveLength(0);
  });

  it('should update the grid cell to be empty after collecting garbage', () => {
    expect(mockState.grid![3][3].content).toBe(CellContentType.GARBAGE);

    taskService.collectGarbage(mockRobot, 'task-garbage-1', mockState);

    // The TaskService should clear the task aspect of the cell.
    // The SimulationService is responsible for updating the cell with the robot's presence.
    // So we check that the GARBAGE content is gone.
    expect(mockState.grid![3][3].content).toBe(CellContentType.EMPTY);
    expect(mockState.grid![3][3].taskId).toBeUndefined();
  });

  it('should return false and not change state if robot is not at the task location', () => {
    // Move the robot away from the task
    mockRobot.x = 0;
    mockRobot.y = 0;
    const initialHp = mockRobot.hp;

    const result = taskService.collectGarbage(mockRobot, 'task-garbage-1', mockState);

    expect(result).toBe(false);
    expect(mockRobot.hp).toBe(initialHp); // HP should not be deducted
    expect(mockState.tasks).toHaveLength(1); // Task should not be removed
  });
});