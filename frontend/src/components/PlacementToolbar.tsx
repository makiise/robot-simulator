// In frontend/src/components/PlacementToolbar.tsx

import React from 'react';
import './PlacementToolbar.css';

export type SelectableItem = 'CERBERUS_BASIC' | 'GARBAGE_BASIC' | null;

interface PlacementToolbarProps {
  budget: number;
  selectedItem: SelectableItem;
  onSelectItem: (item: SelectableItem) => void;
}

const CERBERUS_COST = 100; // Define the cost for disabling the button

const PlacementToolbar: React.FC<PlacementToolbarProps> = ({ budget, selectedItem, onSelectItem }) => {

    console.log("3. PlacementToolbar received budget prop:", budget);
  const handleSelect = (item: SelectableItem) => {
    onSelectItem(selectedItem === item ? null : item);
  };

  return (
    <div className="toolbar-container">
      <h3>Placement Toolbar</h3>
      <div className="toolbar-budget">
        <strong>Budget:</strong> ${budget}
      </div>
      <div className="toolbar-actions">
        <button 
          className={selectedItem === 'CERBERUS_BASIC' ? 'selected' : ''}
          onClick={() => handleSelect('CERBERUS_BASIC')}
          disabled={budget < CERBERUS_COST} // Proactively disable if user can't afford it
        >
          Place Cerberus (Basic)
        </button>
        <button 
          className={selectedItem === 'GARBAGE_BASIC' ? 'selected' : ''}
          onClick={() => handleSelect('GARBAGE_BASIC')}
        >
          Place Garbage (Basic)
        </button>
      </div>
      {selectedItem && (
        <p className="toolbar-selection-info">
          Selected: <strong>{selectedItem}</strong>. Click on the grid to place.
        </p>
      )}
    </div>
  );
};

export default PlacementToolbar;