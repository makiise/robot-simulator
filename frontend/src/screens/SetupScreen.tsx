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
  startSimulation, // <-- Import the function to start the simulation
  SimulationState 
} from '../services/api';

// 1. Define the props that this screen will now receive from App.tsx
interface SetupScreenProps {
  onStartSimulation: () => void;
}

// 2. Update the component definition to accept the new props
const SetupScreen: React.FC<SetupScreenProps> = ({ onStartSimulation }) => {
  const [simulationState, setSimulationState] = useState<SimulationState | null>(null);
  const [selectedItem, setSelectedItem] = useState<SelectableItem>(null);

  const handleCreateGrid = async (rows: number, cols: number, initialBudget: number) => {
    try {
      const initialConfig = await configureSimulation(rows, cols, initialBudget);
      const fullInitialState: SimulationState = {
        ...initialConfig, // Use spread syntax for any other properties
        grid: initialConfig.grid,
        currentBudget: initialConfig.budget,
        robots: [],
        tasks: []
      };
      setSimulationState(fullInitialState);
    } catch (error) {
      console.error("Failed to configure simulation:", error);
      alert("Error setting up grid.");
    }
  };

  const handleCellClick = async (x: number, y: number) => {
    if (!selectedItem) return;
    try {
      if (selectedItem === 'CERBERUS_BASIC') {
        await placeRobot('CERBERUS_BASIC', x, y); 
      } else if (selectedItem === 'GARBAGE_BASIC') {
        await placeItem('GARBAGE_BASIC', x, y);
      } else {
        return;
      }
      const updatedState = await getSimulationState();
      setSimulationState(updatedState);
      setSelectedItem(null); 
    } catch (error: any) {
      console.error("Failed to place item:", error);
      alert(`Placement Failed: ${error.response?.data?.message || error.message}`);
    }
  };

  // 3. This new handler is called when the "Start Simulation" button is clicked
  const handleStartSimulation = async () => {
    try {
      // Call the backend to tell it to start the simulation process
      await startSimulation('NEAREST_BASIC'); // We hardcode the strategy for now
      
      // Call the function passed down from App.tsx. This will switch the view to SimulationScreen.
      onStartSimulation();
    } catch (error) {
      console.error("Failed to start simulation:", error);
      alert("Could not start the simulation. Check the backend server.");
    }
  };

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
          {/* 4. Pass the new handler function to the onStart prop of SimulationControls */}
          <SimulationControls onStart={handleStartSimulation} />
        </div>
      )}
    </div>
  );
};

export default SetupScreen;