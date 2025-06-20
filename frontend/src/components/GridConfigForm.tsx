
import React, { useState } from 'react';


interface GridConfigFormProps {
  onConfigSubmit: (rows: number, cols: number, budget: number) => void;
}

const GridConfigForm: React.FC<GridConfigFormProps> = ({ onConfigSubmit }) => {
  const [rows, setRows] = useState(10);
  const [cols, setCols] = useState(10);
  const [budget, setBudget] = useState(1000);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onConfigSubmit(rows, cols, budget);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Rows: </label>
        <input type="number" value={rows} onChange={(e) => setRows(Number(e.target.value))} />
      </div>
      <div>
        <label>Columns: </label>
        <input type="number" value={cols} onChange={(e) => setCols(Number(e.target.value))} />
      </div>
      <div>
        <label>Initial Budget: </label>
        <input type="number" value={budget} onChange={(e) => setBudget(Number(e.target.value))} />
      </div>
      <button type="submit">Create Grid</button>
    </form>
  );
};

export default GridConfigForm;