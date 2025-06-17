let nextRobotId = 1;
let nextTaskId = 1; // if not bomb

export function generateRobotId(): string {
  return `robot-${nextRobotId++}`;
}

export function generateTaskId(): string {
  return `task-${nextTaskId++}`;
}

// simulation resets --->


export function resetIds(): void {
    nextRobotId = 1;
    nextTaskId = 1;
}