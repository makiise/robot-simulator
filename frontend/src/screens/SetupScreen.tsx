// In frontend/src/screens/SetupScreen.tsx

import React, { useState } from 'react';
import GridConfigForm from '../components/GridConfigForm';
import GridDisplay from '../components/GridDisplay';
import { GridData } from '../types/simulation';
import { configureSimulation } from '../services/api';
// <-- 1. Import the new toolbar component and the SelectableItem type
import PlacementToolbar, { SelectableItem } from '../components/PlacementToolbar';

const SetupScreen = () => {
  const [gridData, setGridData] = useState<GridData | null>(null);
  const [budget, setBudget] = useState<number>(0);
  // <-- 2. Add state to track which item is selected in the toolbar
  const [selectedItem, setSelectedItem] = useState<SelectableItem>(null);

  const handleCreateGrid = async (rows: number, cols: number, initialBudget: number) => {
    try {
      const response = await configureSimulation(rows, cols, initialBudget);
     setGridData(response.grid);;
      setBudget(response.budget);
    } catch (error) {
      console.error("Failed to configure simulation:", error);
      alert("Error connecting to the backend. Please ensure the server is running and try again.");
    }
  };

  return (
    <div>
      {!gridData ? (
        <div>
          <h2>Step 1: Configure Your Simulation</h2>
          <GridConfigForm onConfigSubmit={handleCreateGrid} /> 
        </div>
      ) : (
        // This is the main view after the grid is created
        <div>
          {/* We've removed the old title and will let the components have their own */}
          
          {/* <-- 3. Add the PlacementToolbar here */}
          <PlacementToolbar 
            budget={budget} 
            selectedItem={selectedItem}
            onSelectItem={setSelectedItem} // We pass the state "setter" function directly as a prop
          />

          <GridDisplay gridData={gridData} />
        </div>
      )}
    </div>
  );
};

export default SetupScreen;