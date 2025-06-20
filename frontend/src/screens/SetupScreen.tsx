// In frontend/src/screens/SetupScreen.tsx

import React, { useState } from 'react';

// Component Imports
import GridConfigForm from '../components/GridConfigForm';
import GridDisplay from '../components/GridDisplay';
import PlacementToolbar, { SelectableItem } from '../components/PlacementToolbar';
import SimulationControls from '../components/SimulationControls';

// API and Type Imports
import { 
  configureSimulation, 
  placeRobot, 
  placeItem, 
  getSimulationState,
  SimulationState 
} from '../services/api';

const SetupScreen = () => {
  const [simulationState, setSimulationState] = useState<SimulationState | null>(null);
  const [selectedItem, setSelectedItem] = useState<SelectableItem>(null);

  const handleCreateGrid = async (rows: number, cols: number, initialBudget: number) => {
    try {
      const initialConfig = await configureSimulation(rows, cols, initialBudget);
      const fullInitialState: SimulationState = {
        grid: initialConfig.grid,
        currentBudget: initialConfig.budget,
        robots: [],
        tasks: []
      };
      setSimulationState(fullInitialState);
    } catch (error) {
      console.error("Failed to configure simulation:", error);
      alert("Error setting up grid. Please ensure the backend server is running and accessible.");
    }
  };

  const handleCellClick = async (x: number, y: number) => {
    if (!selectedItem) {
      return;
    }
    try {
      if (selectedItem === 'CERBERUS_BASIC') {
        await placeRobot('CERBERUS_BASIC', x, y); 
      } else if (selectedItem === 'GARBAGE_BASIC') {
        await placeItem('GARBAGE_BASIC', x, y);
      } else {
        return;
      }
      const updatedState = await getSimulationState();
      console.log("1. Received from getSimulationState API:", updatedState); 
      setSimulationState(updatedState);
      setSelectedItem(null); 
    } catch (error: any) {
      console.error("Failed to place item:", error);
      alert(`Placement Failed: ${error.response?.data?.message || error.message}`);
    }
  };
  console.log("2. SetupScreen rendering with state:", simulationState);

  return (
    <div>
      {!simulationState ? (
        <div>
          <h2>Step 1: Configure Your Simulation</h2>
          <GridConfigForm onConfigSubmit={handleCreateGrid} /> 
        </div>
      ) : (
        <div>
          <PlacementToolbar 
            budget={simulationState.currentBudget} 
            selectedItem={selectedItem}
            onSelectItem={setSelectedItem}
          />
          <GridDisplay 
            gridData={simulationState.grid}
            onCellClick={handleCellClick}
          />
          <SimulationControls />
        </div>
      )}
    </div>
  );
};

export default SetupScreen;