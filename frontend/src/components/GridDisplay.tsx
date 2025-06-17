// In frontend/src/components/GridDisplay.tsx

import React from 'react';
import './GridDisplay.css';
import { GridData, GridCell } from '../types/simulation'; // <-- 1. Import our types

// 2. Change the component's props to accept the 'gridData' object
interface GridDisplayProps {
  gridData: GridData;
}

// This is a small helper function that checks a cell's content and returns the right visual
const renderCellContent = (cell: GridCell) => {
  if (cell.content === 'BOMB') {
    return '💣'; // If the content is 'BOMB', return the bomb emoji
  }
  return null; // Otherwise, return nothing
};

const GridDisplay: React.FC<GridDisplayProps> = ({ gridData }) => {
  // Get the number of columns from the gridData itself
  const cols = gridData[0]?.length || 0;

  return (
    <div 
      className="grid-container" 
      style={{ gridTemplateColumns: `repeat(${cols}, 40px)` }}
    >
      {/* 
        3. We now map directly over the data from the backend.
        .flat() converts the 2D array [[]] into a simple 1D array [] to make it easier to map.
      */}
      {gridData.flat().map((cell, index) => (
        <div key={index} className="grid-cell">
          {/* For each cell, we call our helper function to see what should be displayed inside it */}
          {renderCellContent(cell)}
        </div>
      ))}
    </div>
  );
};

export default GridDisplay;