import axios from 'axios';
import { GridData } from '../types/simulation'; 


const API_BASE_URL = 'http://localhost:3001/api';


interface ConfigureResponse {
  grid: GridData;
  budget: number;
}


export const configureSimulation = async (rows: number, cols: number, initialBudget: number) => {
  const response = await axios.post<ConfigureResponse>(
    `${API_BASE_URL}/simulation/configure`, 
    { rows, cols, initialBudget } 
  );
  

  return response.data;
};


export interface Robot {
  id: string;
  type: string;
  x: number;
  y: number;
  hp: number;
}


export interface SimulationState {
  grid: GridData;
  robots: Robot[];
  tasks: Task[];
  currentBudget: number;
  gameStatus: 'SETUP' | 'RUNNING' | 'PAUSED' | 'WON' | 'LOST'; 
  initialBudget?: number;
  isRunning?: boolean;
  rows?: number;
  cols?: number;
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

}


export const placeRobot = async (type: string, x: number, y: number) => {
  const response = await axios.post<SimulationState>(
    `${API_BASE_URL}/simulation/place/robot`, 
    { type, x, y }
  );
  return response.data;
};


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



export const startSimulation = async (strategy: string) => {

  await axios.post(`${API_BASE_URL}/simulation/start`, { strategy });
};



export const controlSimulation = async (action: 'PAUSE' | 'RESET') => {

  await axios.post(`${API_BASE_URL}/simulation/control`, { action });
};