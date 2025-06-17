
import React from 'react';
import './GridDisplay.css';

interface GridDisplayProps {
  rows: number;
  cols: number;
}

const GridDisplay: React.FC<GridDisplayProps> = ({ rows, cols }) => {
  const totalCells = rows * cols;
  const cells = Array.from({ length: totalCells });

  return (
    <div 
      className="grid-container" 
      style={{ gridTemplateColumns: `repeat(${cols}, 40px)` }}
    >
      {cells.map((_, index) => (
        <div key={index} className="grid-cell"></div>
      ))}
    </div>
  );
};

export default GridDisplay;