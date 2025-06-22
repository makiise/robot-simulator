// In frontend/src/components/SimulationControls.tsx

import React from 'react';

// Define the possible states for the controls, which we'll get from the parent
export type ControlStatus = 'SETUP' | 'RUNNING' | 'PAUSED' | 'ENDED';

interface SimulationControlsProps {
  status: ControlStatus;
  onStart?: () => void; // Optional: only needed in SETUP
  onPause?: () => void; // Optional: only needed when RUNNING/PAUSED
  onReset?: () => void; // Optional: only needed when RUNNING/PAUSED/ENDED
}

const SimulationControls: React.FC<SimulationControlsProps> = ({ status, onStart, onPause, onReset }) => {
  return (
    <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #555', borderRadius: '8px' }}>
      <h3>Simulation Controls</h3>
      
      {/* --- Renders only during the SETUP phase --- */}
      {status === 'SETUP' && (
        <>
          <div>
            <label htmlFor="strategy-select" style={{ marginRight: '10px' }}>Select Strategy:</label>
            <select id="strategy-select" name="strategy">
              <option value="NEAREST_BASIC">Strategy 1 (Nearest - Basic)</option>
            </select>
          </div>
          <div style={{ marginTop: '15px' }}>
            <button onClick={onStart} style={{ padding: '10px 20px', fontSize: '1.1em', cursor: 'pointer' }}>
              Start Simulation
            </button>
          </div>
        </>
      )}

      {/* --- Renders only when the simulation is RUNNING or PAUSED --- */}
      {(status === 'RUNNING' || status === 'PAUSED') && (
        <div style={{ marginTop: '15px' }}>
          <button onClick={onPause} style={{ padding: '10px 20px', marginRight: '10px' }}>
            {/* The button text changes based on the status */}
            {status === 'RUNNING' ? 'Pause' : 'Resume'}
          </button>
          <button onClick={onReset} style={{ padding: '10px 20px' }}>
            Reset
          </button>
        </div>
      )}

      {/* --- Renders only when the simulation has ENDED (Won/Lost) --- */}
      {status === 'ENDED' && (
        <div style={{ marginTop: '15px' }}>
           <button onClick={onReset} style={{ padding: '10px 20px' }}>
              Play Again
            </button>
        </div>
      )}
    </div>
  );
};

export default SimulationControls;