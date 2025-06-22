// In frontend/src/components/InfoPanel.tsx

import React from 'react';
// We need to import the Robot type definition from our API service file
import { Robot } from '../services/api'; 

// Define the props this component expects
interface InfoPanelProps {
  robots: Robot[];
  // In the future, you could add more props like:
  // tickCount: number;
  // gameStatus: string;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ robots }) => {
  return (
    <div style={{ padding: '10px 15px', border: '1px solid #555', borderRadius: '8px', margin: '20px 0', textAlign: 'left', backgroundColor: '#2a2a2a' }}>
      <h3>Robot Status</h3>
      {robots.length === 0 ? (
        <p>No robots were deployed.</p>
      ) : (
        <ul style={{ margin: 0, padding: 0 }}>
          {/* We map over the array of robots passed in as a prop */}
          {robots.map(robot => (
            <li key={robot.id} style={{ listStyle: 'none', padding: '5px 0' }}>
              <strong>{robot.type} (ID: {robot.id}):</strong> HP: <span style={{ color: robot.hp > 50 ? '#aaeebb' : '#f87171' }}>{robot.hp}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default InfoPanel;