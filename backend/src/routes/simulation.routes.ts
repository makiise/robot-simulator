import { Router } from 'express';
import { configureSimulation, getSimulationState } from '@/controllers/simulation.controller';
// import other functions after creating them

const router = Router();

router.post('/configure', configureSimulation);
router.get('/state', getSimulationState); // frontend will use this to poll

// router.post('/place/robot', placeRobotController); 
// router.post('/place/item', placeItemController); 
// router.post('/start', startSimulationController); 
// router.post('/control', controlSimulationController); 

export default router;