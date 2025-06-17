// In frontend/src/services/api.ts

import axios from 'axios';
import { GridData } from '../types/simulation'; // Import the types 

// --- IMPORTANT
const API_BASE_URL = 'http://localhost:3001/api';

// This describes the data I expect to get back from the backend after I ask it to create a grid.
interface ConfigureResponse {
  grid: GridData;
  budget: number;
}

// This is the function I will call from my UI.
export const configureSimulation = async (rows: number, cols: number, initialBudget: number) => {
  // Use Axios to send a POST request to Mariam's endpoint.
  const response = await axios.post<ConfigureResponse>(
    `${API_BASE_URL}/simulation/configure`, // The full URL of the endpoint
    { rows, cols, initialBudget } // The data I am sending to the backend
  );
  
  // Return the data part of the response (which contains gridData and budget).
  return response.data;
};