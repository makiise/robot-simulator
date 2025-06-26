import React from 'react';
import styles from './SimulationControls.module.css';

export type ControlStatus = 'SETUP' | 'RUNNING' | 'PAUSED' | 'ENDED';

interface SimulationControlsProps {
  status: ControlStatus;
  onStart?: () => void;
  onPause?: () => void;
  onReset?: () => void;
  selectedStrategy?: string;
  onStrategyChange?: (strategy: string) => void;
}


const SimulationControls: React.FC<SimulationControlsProps> = ({ status, onStart, onPause, onReset, selectedStrategy,
  onStrategyChange }) => {
  return (
    <div className={styles.container}>
      <h3 className={styles.heading}>Simulation Controls</h3>

      {status === 'SETUP' && (
        <>
          <div className={styles.controlGroup}>
            <label htmlFor="strategy-select" className={styles.label}>Select Strategy:</label>
            <select
              id="strategy-select"
              name="strategy"
              className={styles.select}
              value={selectedStrategy}
              onChange={(e) => onStrategyChange?.(e.target.value)}
            >
              <option value="NEAREST_BASIC">Strategy 1 (Nearest - Basic)</option>
              <option value="ROUND_ROBIN">Strategy 2 (Round Robin)</option> 
            </select>

          </div>
          <div className={styles.buttonGroup}>
            <button onClick={onStart} className={styles.button}>Start Simulation</button>
          </div>
        </>
      )}

      {(status === 'RUNNING' || status === 'PAUSED') && (
        <div className={styles.buttonGroup}>
          <button onClick={onPause} className={styles.button}>
            {status === 'RUNNING' ? 'Pause' : 'Resume'}
          </button>
          <button onClick={onReset} className={styles.button}>Reset</button>
        </div>
      )}

      {status === 'ENDED' && (
        <div className={styles.buttonGroup}>
          <button onClick={onReset} className={styles.button}>Play Again</button>
        </div>
      )}
    </div>
  );
};

export default SimulationControls;
