// In frontend/src/screens/SimulationScreen.tsx

import React, { useState, useEffect } from 'react';
import { getSimulationState, SimulationState } from '../services/api';
import GridDisplay from '../components/GridDisplay'; // We will reuse our GridDisplay component

const POLLING_INTERVAL_MS = 1000; // Ask the backend for updates every 1 second

const SimulationScreen = () => {
  // This state will hold the latest data we get from the backend
  const [simulationState, setSimulationState] = useState<SimulationState | null>(null);
  const [error, setError] = useState<string | null>(null);

  // The useEffect hook is a standard React feature for handling side effects,
  // like timers, intervals, and API calls after the component renders.
  useEffect(() => {
    // This is the function that will be called repeatedly to get updates
    const fetchState = async () => {
      try {
        const state = await getSimulationState();
        setSimulationState(state);
      } catch (err) {
        console.error("Polling failed: Failed to fetch simulation state:", err);
        setError("Connection to the simulation server was lost.");
        // We'll stop the interval if there's an error
        clearInterval(intervalId);
      }
    };

    // --- Setting up the polling ---
    // 1. Fetch the state immediately when the screen first loads
    fetchState();

    // 2. Set up an interval to call fetchState every second
    const intervalId = setInterval(fetchState, POLLING_INTERVAL_MS);

    // 3. This is a crucial cleanup function. 
    // When this component is removed from the screen, React will run this function.
    // We clear the interval to prevent it from running in the background forever, which causes memory leaks.
    return () => {
      clearInterval(intervalId);
    };
  }, []); // The empty `[]` at the end means this useEffect runs only ONCE when the component first mounts.

  // --- Render Logic ---
  // Show an error message if the polling fails
  if (error) {
    return <div>Error: {error}</div>;
  }

  // Show a loading message until we get the first successful response from the backend
  if (!simulationState) {
    return <div>Loading Simulation...</div>;
  }

  // This is a placeholder function because the grid is not interactive during the simulation.
  const onCellClick = () => {};

  return (
    <div>
      <h2>Simulation Running</h2>
      <p>Current Budget: ${simulationState.currentBudget}</p>
      {/* We can add more info here later, like tick count */}

      {/* We cleverly reuse our existing GridDisplay component to show the live grid! */}
      <GridDisplay 
        gridData={simulationState.grid} 
        onCellClick={onCellClick}
      />
    </div>
  );
};

export default SimulationScreen;