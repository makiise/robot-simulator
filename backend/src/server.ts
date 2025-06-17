import express, { Request, Response, Application } from 'express';

const app: Application = express();
const PORT = process.env.PORT || 3001; // Backend will run on port 3001

// Middleware to parse JSON bodies
app.use(express.json());

// A simple test route
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'Backend is healthy as a doctor house!', timestamp: new Date().toISOString() });
});

// Placeholder for future simulation routes
// app.use('/api/simulation', simulationRoutes); // You'll create simulationRoutes later

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});