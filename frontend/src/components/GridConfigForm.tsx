import React, { useState } from 'react';
import styles from './GridConfigForm.module.css';

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
    <form className={styles.formContainer} onSubmit={handleSubmit}>
      <div className={styles.formGroup}>
        <label htmlFor="rows" className={styles.label}>Rows</label>
        <input
          id="rows"
          className={styles.input}
          type="number"
          value={rows}
          placeholder="Enter number of rows"
          title="Number of rows"
          onChange={(e) => setRows(Number(e.target.value))}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="cols" className={styles.label}>Columns</label>
        <input
          id="cols"
          className={styles.input}
          type="number"
          value={cols}
          placeholder="Enter number of columns"
          title="Number of columns"
          onChange={(e) => setCols(Number(e.target.value))}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="budget" className={styles.label}>Initial Budget</label>
        <input
          id="budget"
          className={styles.input}
          type="number"
          value={budget}
          placeholder="Enter initial budget"
          title="Initial budget"
          onChange={(e) => setBudget(Number(e.target.value))}
        />
      </div>

      <button type="submit" className={styles.button}>Create Grid</button>
    </form>
  );
};

export default GridConfigForm;
