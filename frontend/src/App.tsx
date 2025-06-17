// In frontend/src/App.tsx
import React from 'react';
import SetupScreen from './screens/SetupScreen';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Robot Task Simulator</h1>
        <SetupScreen />
      </header>
    </div>
  );
}

export default App;