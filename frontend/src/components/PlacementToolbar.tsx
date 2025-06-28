import React from 'react';
import styles from './PlacementToolbar.module.css';

export type SelectableItem = 'CERBERUS_BASIC' | 'GARBAGE_BASIC' | null;

interface PlacementToolbarProps {
  budget: number;
  selectedItem: SelectableItem;
  onSelectItem: (item: SelectableItem) => void;
}

const CERBERUS_COST = 100;

const PlacementToolbar: React.FC<PlacementToolbarProps> = ({ budget, selectedItem, onSelectItem }) => {
  const handleSelect = (item: SelectableItem) => {
    onSelectItem(selectedItem === item ? null : item);
  };

  return (
    <div className={styles.toolbarContainer}>
      <h3 style={{ fontSize: '20px' }}>Placement Toolbar</h3>
      <div className={styles.toolbarBudget}>
        <strong>Budget:</strong> ${budget}
      </div>
      <div className={styles.toolbarActions}>
        <button
          className={selectedItem === 'CERBERUS_BASIC' ? styles.selected : ''}
          onClick={() => handleSelect('CERBERUS_BASIC')}
          disabled={budget < CERBERUS_COST}
        >
          Place Cerberus (Basic)
        </button>
        <button
          className={selectedItem === 'GARBAGE_BASIC' ? styles.selected : ''}
          onClick={() => handleSelect('GARBAGE_BASIC')}
        >
          Place Garbage (Basic)
        </button>
      </div>
      {selectedItem && (
        <p className={styles.toolbarSelectionInfo}>
          Selected: <strong>{selectedItem}</strong>. Click on the grid to place.
        </p>
      )}
    </div>
  );
};

export default PlacementToolbar;
