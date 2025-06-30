import express, { Request, Response, Application } from 'express';
import cors from 'cors'; 
import simulationRoutes from './routes/simulation.routes';

const app: Application = express();
const PORT = process.env.PORT || 3001;

// parsing json body
app.use(express.json());

// CORS 

app.use('/api/simulation', simulationRoutes);

const corsOptions = {
  origin: 'http://localhost:3000', // allows my  frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  optionsSuccessStatus: 200 // support
};
app.use(cors(corsOptions)); //  cors middleware

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'Backend is healthy as a doctor house!', timestamp: new Date().toISOString() });
});

app.use('/api/simulation', simulationRoutes);

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});