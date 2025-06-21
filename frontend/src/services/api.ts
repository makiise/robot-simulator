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

// Add this code to the end of frontend/src/services/api.ts

// It's good practice to define the shape of the full simulation state
export interface Robot {
  id: string;
  type: string;
  x: number;
  y: number;
  hp: number;
}

export interface Task {
  id: string;
  type: string;
  x: number;
  y: number;
}

export interface SimulationState {
  grid: GridData;
  robots: Robot[];
  tasks: Task[];
  currentBudget: number;
  // We'll add more properties like gameStatus later
}

// Function to place a robot
export const placeRobot = async (type: string, x: number, y: number) => {
  const response = await axios.post<SimulationState>(
    `${API_BASE_URL}/simulation/place/robot`, 
    { type, x, y }
  );
  return response.data;
};

// Function to place an item/task
export const placeItem = async (type: string, x: number, y: number) => {
  const response = await axios.post<SimulationState>(
    `${API_BASE_URL}/simulation/place/item`,
    { type, x, y }
  );
  return response.data;
};

export const getSimulationState = async () => {
  const response = await axios.get<SimulationState>(`${API_BASE_URL}/simulation/state`);
  return response.data;
};

// Add this to the end of frontend/src/services/api.ts

export const startSimulation = async (strategy: string) => {
  // This endpoint might not return anything significant, just a success message.
  await axios.post(`${API_BASE_URL}/simulation/start`, { strategy });
};