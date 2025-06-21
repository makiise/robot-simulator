// In frontend/src/App.tsx

import React, { useState } from 'react';
import SetupScreen from './screens/SetupScreen';
import SimulationScreen from './screens/SimulationScreen';
import './App.css';

// We define the possible views our application can have.
type AppView = 'SETUP' | 'SIMULATION';

function App() {
  // This state variable controls which screen is currently visible.
  const [currentView, setCurrentView] = useState<AppView>('SETUP');

  // We create a function that can be passed down to the SetupScreen.
  // When called, it will change the view to 'SIMULATION'.
  const startSimulationView = () => {
    setCurrentView('SIMULATION');
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Robot Task Simulator</h1>

        {/* This is a conditional render. It checks the value of currentView. */}
        {currentView === 'SETUP' && (
          // If the view is 'SETUP', render the SetupScreen.
          // We pass it the function so it can tell the App to switch views.
          <SetupScreen onStartSimulation={startSimulationView} />
        )}

        {currentView === 'SIMULATION' && (
          // If the view is 'SIMULATION', render the SimulationScreen.
          <SimulationScreen />
        )}
      </header>
    </div>
  );
}

export default App;