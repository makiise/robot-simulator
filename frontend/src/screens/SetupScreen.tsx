

import React, { useState } from 'react';

// Component Imports
import GridConfigForm from '../components/GridConfigForm';
import GridDisplay from '../components/GridDisplay';
import PlacementToolbar, { SelectableItem } from '../components/PlacementToolbar';
import SimulationControls from '../components/SimulationControls';


import { 
  configureSimulation, 
  placeRobot, 
  placeItem, 
  getSimulationState,
  startSimulation, 
  SimulationState 
} from '../services/api';


interface SetupScreenProps {
  onStartSimulation: () => void;
}


const SetupScreen: React.FC<SetupScreenProps> = ({ onStartSimulation }) => {
  const [simulationState, setSimulationState] = useState<SimulationState | null>(null);
  const [selectedItem, setSelectedItem] = useState<SelectableItem>(null);

  const handleCreateGrid = async (rows: number, cols: number, initialBudget: number) => {
    try {
      const initialConfig = await configureSimulation(rows, cols, initialBudget);

      const fullInitialState: SimulationState = {
        grid: initialConfig.grid,
        currentBudget: initialConfig.budget,
        robots: [],
        tasks: [],
        gameStatus: 'SETUP' 
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


  const handleStartSimulation = async () => {
    try {

      await startSimulation('NEAREST_BASIC'); 
      

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
      <div
        style={{
          display: 'flex',
          gap: '20px',
          alignItems: 'stretch', 
        }}
      >
        {}
        <div style={{ flex: 2 }}>
          <GridDisplay
            gridData={simulationState.grid}
            onCellClick={handleCellClick}
          />
        </div>

        {}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            height: '100%',
            marginTop: '20px', 
          }}
        >
          <div style={{ flex: 2 }}>
            <SimulationControls status="SETUP" onStart={handleStartSimulation} />
          </div>
          <div style={{ flex: 1 }}>
            <PlacementToolbar
              budget={simulationState.currentBudget}
              selectedItem={selectedItem}
              onSelectItem={setSelectedItem}
            />
          </div>
          
        </div>

      </div>
    )}
  </div>
);

};

export default SetupScreen;