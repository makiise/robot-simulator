// In frontend/src/components/GridDisplay.tsx
import React from 'react';
import './GridDisplay.css';
import { GridData, GridCell } from '../types/simulation';

// Define a new prop for the click handler
interface GridDisplayProps {
  gridData: GridData;
  onCellClick: (x: number, y: number) => void; // A function that takes x, y coordinates
}

const renderCellContent = (cell: GridCell) => {
  switch (cell.content) {
    case 'BOMB': return '💣';
    case 'ROBOT': return '🤖';
    case 'GARBAGE': return '🗑️';
    default: return null;
  }
};

const GridDisplay: React.FC<GridDisplayProps> = ({ gridData, onCellClick }) => {
  const cols = gridData[0]?.length || 0;

  const handleCellClick = (index: number) => {
    if (cols === 0) return;
    const x = index % cols;
    const y = Math.floor(index / cols);
    onCellClick(x, y); // Call the parent's function with the calculated coordinates
  };

  return (
    <div className="grid-container" style={{ gridTemplateColumns: `repeat(${cols}, 40px)` }}>
      {gridData.flat().map((cell, index) => (
        <div 
          key={index} 
          className="grid-cell"
          onClick={() => handleCellClick(index)} // Add the onClick event
        >
          {renderCellContent(cell)}
        </div>
      ))}
    </div>
  );
};

export default GridDisplay;