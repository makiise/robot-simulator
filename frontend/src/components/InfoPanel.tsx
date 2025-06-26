import React from 'react';
import { Robot, Task } from '../services/api';

interface InfoPanelProps {
  robots: Robot[];
  tickCount: number;
  currentBudget: number;
  tasks: Task[];
}

const InfoPanel: React.FC<InfoPanelProps> = ({ robots, tickCount, currentBudget, tasks }) => {
  const remainingGarbageTasks = tasks.filter(task => task.type === 'GARBAGE_BASIC' && !task.completed).length;

  return (
    <div style={{
      padding: '10px 15px',
      border: '1px solid #555',
      borderRadius: '8px',
      margin: '20px 0',
      textAlign: 'left',
      backgroundColor: '#2a2a2a',
      color: '#fff'
    }}>
      <h3>Simulation Summary</h3>

      <p><strong>Tick Count:</strong> {tickCount}</p>
      <p><strong>Current Budget:</strong> ${currentBudget}</p>
      <p><strong>Remaining GARBAGE_BASIC Tasks:</strong> {remainingGarbageTasks}</p>

      <h4>Robot Status</h4>
      {robots.length === 0 ? (
        <p>No robots were deployed.</p>
      ) : (
        <ul style={{ margin: 0, paddingLeft: 15 }}>
          {robots.map(robot => (
            <li key={robot.id} style={{ padding: '4px 0' }}>
              <strong>{robot.type} (ID: {robot.id}):</strong>{' '}
              HP: <span style={{ color: robot.hp > 50 ? '#aaeebb' : '#f87171' }}>{robot.hp}</span>,{' '}
              Task: {robot.assignedTaskId ?? 'Idle'}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default InfoPanel;
