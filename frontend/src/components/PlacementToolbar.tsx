// In frontend/src/components/PlacementToolbar.tsx

import React from 'react';
import './PlacementToolbar.css'; // We'll add styles in the next step

// This defines the types of items a user can select. 'null' means nothing is selected.
export type SelectableItem = 'CERBERUS_BASIC' | 'GARBAGE_BASIC' | null;

// This defines the props (inputs) our component will need from its parent.
interface PlacementToolbarProps {
  budget: number;
  selectedItem: SelectableItem;
  onSelectItem: (item: SelectableItem) => void; // This is a function to tell the parent which item was clicked.
}

const PlacementToolbar: React.FC<PlacementToolbarProps> = ({ budget, selectedItem, onSelectItem }) => {

  // A small helper function to handle clicking on the buttons
  const handleSelect = (item: SelectableItem) => {
    // If the user clicks the currently selected button, it deselects it (sets to null).
    // Otherwise, it selects the new item.
    onSelectItem(selectedItem === item ? null : item);
  };

  return (
    <div className="toolbar-container">
      <h3>Placement Toolbar</h3>
      <div className="toolbar-budget">
        <strong>Budget:</strong> ${budget}
      </div>
      <div className="toolbar-actions">
        {/* The 'className' changes dynamically to show which button is selected */}
        <button 
          className={selectedItem === 'CERBERUS_BASIC' ? 'selected' : ''}
          onClick={() => handleSelect('CERBERUS_BASIC')}
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
      {/* This message will only appear if an item is selected */}
      {selectedItem && (
        <p className="toolbar-selection-info">
          Selected: <strong>{selectedItem}</strong>. Click on the grid to place.
        </p>
      )}
    </div>
  );
};

export default PlacementToolbar;