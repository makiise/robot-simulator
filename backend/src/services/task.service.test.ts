import { TaskService } from './task.service';
import {
  SimulationState,
  BasicRobot,
  RobotStatus,
  Task, 
  TaskType, 
  TaskStatus, 
  CellContentType,
} from '@/types/common.types';

jest.mock('./grid.service', () => {
  return {
    GridService: jest.fn().mockImplementation(() => {
      return { isWithinBounds: () => true }; 
    }),
  };
});

describe('TaskService', () => {
  let taskService: TaskService;
  let mockState: SimulationState;
  let mockRobot: BasicRobot; 
  let mockGarbageTask: Task; 

  beforeEach(() => {
    taskService = new TaskService();

    mockRobot = {
      id: 'robot-1',
      type: 'CERBERUS_BASIC',
      x: 3,
      y: 3,
      hp: 100,
      initialHp: 100, 
      status: RobotStatus.PERFORMING_TASK,
      assignedTaskId: 'task-garbage-1',
    };

    mockGarbageTask = {
      id: 'task-garbage-1',
      type: TaskType.GARBAGE, 
      x: 3,
      y: 3,
      status: TaskStatus.ASSIGNED, 
      assignedToRobotId: 'robot-1',
    };

    mockState = {
      robots: [mockRobot],
      tasks: [mockGarbageTask],
      grid: Array(5).fill(null).map(() =>
        Array(5).fill(null).map(() => ({ content: CellContentType.EMPTY }))
      ),
      gameStatus: 'RUNNING',
      isRunning: true,
      speedMultiplier: 1, 
    };

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

    expect(mockState.grid![3][3].content).toBe(CellContentType.EMPTY);
    expect(mockState.grid![3][3].taskId).toBeUndefined();
  });

  it('should return false and not change state if robot is not at the task location', () => {
    mockRobot.x = 0;
    mockRobot.y = 0;
    const initialHp = mockRobot.hp;

    const result = taskService.collectGarbage(mockRobot, 'task-garbage-1', mockState);

    expect(result).toBe(false);
    expect(mockRobot.hp).toBe(initialHp); 
    expect(mockState.tasks).toHaveLength(1); 
  });
});