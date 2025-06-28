import React from 'react';
import styles from './GridDisplay.module.css';
import { GridData, GridCell } from '../types/simulation';

interface GridDisplayProps {
  gridData: GridData;
  onCellClick: (x: number, y: number) => void;
}

const renderCellContent = (cell: GridCell) => {
  switch (cell.content) {
    case 'BOMB':
      return '💣';
    case 'ROBOT':
      return '🤖';
    case 'GARBAGE':
      return '🗑️';
    default:
      return null;
  }
};

const GridDisplay: React.FC<GridDisplayProps> = ({ gridData, onCellClick }) => {
  const cols = gridData[0]?.length || 0;

  const handleCellClick = (index: number) => {
    if (cols === 0) return;
    const x = index % cols;
    const y = Math.floor(index / cols);
    onCellClick(x, y);
  };

  return (
    <div
      className={styles.gridContainer}
      style={{ gridTemplateColumns: `repeat(${cols}, 40px)` }}
    >
      {gridData.flat().map((cell, index) => (
        <div
          key={index}
          className={styles.gridCell}
          onClick={() => handleCellClick(index)}
        >
          {renderCellContent(cell)}
        </div>
      ))}
    </div>
  );
};

export default GridDisplay;
