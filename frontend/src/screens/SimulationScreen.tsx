// In frontend/src/screens/SimulationScreen.tsx

import React, { useState, useEffect, useRef } from 'react';
import { controlSimulation, getSimulationState, SimulationState } from '../services/api';
import GridDisplay from '../components/GridDisplay';
import InfoPanel from '../components/InfoPanel'; 
import SimulationControls, { ControlStatus } from '../components/SimulationControls'; // Import the new status type

const POLLING_INTERVAL_MS = 1000; // 1 second

// 1. DEFINE THE PROPS FOR THIS COMPONENT
interface SimulationScreenProps {
  onReset: () => void; // It now expects a function called onReset
}

// 2. UPDATE THE COMPONENT TO ACCEPT THE PROPS
const SimulationScreen: React.FC<SimulationScreenProps> = ({ onReset }) => {
  const [simulationState, setSimulationState] = useState<SimulationState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  // useRef is used to hold the interval ID so it doesn't get lost between re-renders
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // This function starts the polling interval
  const startPolling = () => {
    // Clear any existing interval before starting a new one
    if (intervalRef.current) clearInterval(intervalRef.current);

    const fetchState = async () => {
      try {
        const state = await getSimulationState();
        setSimulationState(state);
        // If the game is won or lost, stop polling
        if (state.gameStatus === 'WON' || state.gameStatus === 'LOST') {
          stopPolling();
        }
      } catch (err) {
        console.error("Polling failed:", err);
        setError("Connection lost.");
        stopPolling();
      }
    };
    fetchState(); // Fetch immediately
    intervalRef.current = setInterval(fetchState, POLLING_INTERVAL_MS);
  };

  // This function stops the polling
  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // This effect hook manages the polling lifecycle
  useEffect(() => {
    startPolling();
    // This is the cleanup function that runs when the component is unmounted
    return () => stopPolling();
  }, []); // The empty [] means this effect runs only once on mount

  // --- HANDLERS FOR THE CONTROLS ---
  const handlePauseToggle = async () => {
    try {
      await controlSimulation('PAUSE'); // We only have one 'PAUSE' action that toggles
      if (isPaused) {
        startPolling(); // If it was paused, resume polling
      } else {
        stopPolling(); // If it was running, stop polling
      }
      setIsPaused(!isPaused); // Toggle the local paused state
    } catch (error) {
      console.error("Failed to pause/resume simulation", error);
    }
  };

  const handleReset = async () => {
    try {
      stopPolling(); // Stop polling immediately
      await controlSimulation('RESET');
      onReset(); // Call the function from App.tsx to go back to the setup screen
    } catch (error) {
      console.error("Failed to reset simulation", error);
    }
  };


  // --- RENDER LOGIC ---
  if (error) return <div>Error: {error}</div>;
  if (!simulationState) return <div>Loading Simulation...</div>;

  // Determine the control status based on the game state
  let controlStatus: ControlStatus = 'RUNNING';
  if (isPaused) controlStatus = 'PAUSED';
  if (simulationState.gameStatus === 'WON' || simulationState.gameStatus === 'LOST') {
    controlStatus = 'ENDED';
  }

  return (
    <div>
      {/* 3. BASIC WIN/LOSS DISPLAY (F.F20) */}
      {simulationState.gameStatus === 'WON' && <h2>Congratulations, You Won!</h2>}
      {simulationState.gameStatus === 'LOST' && <h2>Game Over!</h2>}
      
      {/* 4. BASIC INFORMATION DISPLAY (F.F19) */}
      <InfoPanel robots={simulationState.robots} />

      <GridDisplay 
        gridData={simulationState.grid} 
        onCellClick={() => {}} // Grid is not clickable during simulation
      />
      
      {/* 5. PAUSE/RESET UI (F.F17) */}
      <SimulationControls 
        status={controlStatus} 
        onPause={handlePauseToggle}
        onReset={handleReset}
      />
    </div>
  );
};

export default SimulationScreen;