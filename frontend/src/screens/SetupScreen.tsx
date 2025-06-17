
import React, { useState } from 'react';
import GridConfigForm from '../components/GridConfigForm';
import GridDisplay from '../components/GridDisplay';

const SetupScreen = () => {
  const [gridConfig, setGridConfig] = useState<{rows: number, cols: number} | null>(null);

  const handleCreateGrid = (rows: number, cols: number, budget: number) => {
    console.log(`Creating grid with ${rows}x${cols} and budget ${budget}`);
    setGridConfig({ rows, cols });
  };

  return (
    <div>
      {!gridConfig ? (
        <div>
          <h2>Step 1: Configure Your Simulation</h2>
          <GridConfigForm onConfigSubmit={handleCreateGrid} /> 
        </div>
      ) : (
        <div>
          <h2>Grid Setup</h2>
          <GridDisplay rows={gridConfig.rows} cols={gridConfig.cols} />
        </div>
      )}
    </div>
  );
};

export default SetupScreen;