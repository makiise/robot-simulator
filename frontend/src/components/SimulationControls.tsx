// In frontend/src/components/SimulationControls.tsx
import React from 'react';

// Define the props: it now needs a function to call when 'Start' is clicked
interface SimulationControlsProps {
  onStart: () => void;
}

const SimulationControls: React.FC<SimulationControlsProps> = ({ onStart }) => {
  return (
    <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #555', borderRadius: '8px' }}>
      <h3>Simulation Controls</h3>
      <div>
        <label htmlFor="strategy-select" style={{ marginRight: '10px' }}>Select Strategy:</label>
        <select id="strategy-select" name="strategy">
          <option value="NEAREST_BASIC">Strategy 1 (Nearest - Basic)</option>
        </select>
      </div>
      <div style={{ marginTop: '15px' }}>
        {/* The new Start button, which calls the onStart function from its props */}
        <button onClick={onStart} style={{ padding: '10px 20px', fontSize: '1.1em', cursor: 'pointer' }}>
          Start Simulation
        </button>
      </div>
    </div>
  );
};

export default SimulationControls;