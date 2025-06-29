// In frontend/src/components/SimulationControls.tsx
import React from 'react';

// For now, this component doesn't need any props
const SimulationControls = () => {
  return (
    <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #555', borderRadius: '8px' }}>
      <h3>Simulation Controls</h3>
      <div>
        <label htmlFor="strategy-select" style={{ marginRight: '10px' }}>Select Strategy:</label>
        <select id="strategy-select" name="strategy">
          <option value="NEAREST_BASIC">Strategy 1 (Nearest - Basic)</option>
          {/* In the future, other <option>s for different strategies would go here */}
        </select>
      </div>
      {/* The "Start" button will go here in the afternoon tasks */}
    </div>
  );
};

export default SimulationControls;