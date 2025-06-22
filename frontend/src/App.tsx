// In frontend/src/App.tsx

import React, { useState } from 'react';
import SetupScreen from './screens/SetupScreen';
import SimulationScreen from './screens/SimulationScreen';
import './App.css';

type AppView = 'SETUP' | 'SIMULATION';

function App() {
  const [currentView, setCurrentView] = useState<AppView>('SETUP');
  // We add a 'key' to the SetupScreen to force it to re-mount and reset its internal state when we navigate back to it.
  const [setupScreenKey, setSetupScreenKey] = useState(Date.now());

  const startSimulationView = () => {
    setCurrentView('SIMULATION');
  };

  const resetApp = () => {
    setSetupScreenKey(Date.now()); // Change the key to force a reset
    setCurrentView('SETUP');
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Robot Task Simulator</h1>
        {currentView === 'SETUP' && (
          <SetupScreen key={setupScreenKey} onStartSimulation={startSimulationView} />
        )}
        {currentView === 'SIMULATION' && (
          // Pass the reset function down to the simulation screen
          <SimulationScreen onReset={resetApp} />
        )}
      </header>
    </div>
  );
}

export default App;