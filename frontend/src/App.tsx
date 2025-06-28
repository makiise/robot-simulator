

import React, { useState } from 'react';
import SetupScreen from './screens/SetupScreen';
import SimulationScreen from './screens/SimulationScreen';
import BackgroundIcons from './components/BackgroundIcons';
import styles from './App.module.css';

type AppView = 'SETUP' | 'SIMULATION';

function App() {
  const [currentView, setCurrentView] = useState<AppView>('SETUP');
  const [setupScreenKey, setSetupScreenKey] = useState(Date.now());



  const startSimulationView = () => {
    setCurrentView('SIMULATION');
  };

  const resetApp = () => {
    setSetupScreenKey(Date.now());
    setCurrentView('SETUP');
  };

  return (
    <div className={styles.App} style={{ position: 'relative', overflow: 'hidden' }}>
      <header className={styles.AppHeader}>
        <BackgroundIcons />
        {}
        <div className={styles.foregroundContent}>
          <h1>Robot Task Simulator</h1>
          {currentView === 'SETUP' && (
            <SetupScreen key={setupScreenKey} onStartSimulation={startSimulationView} />
          )}
          {currentView === 'SIMULATION' && (
            <SimulationScreen onReset={resetApp} />
          )}
        </div>
      </header>
    </div>
  );
}

export default App;