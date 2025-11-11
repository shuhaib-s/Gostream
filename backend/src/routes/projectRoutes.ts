import { Router } from 'express';
import {
  createProject,
  getProjects,
  getProjectById,
  deleteProject,
  createDestination,
  updateDestination,
  deleteDestination,
} from '../controllers/projectController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// All project routes require authentication
router.use(authMiddleware);

router.post('/', createProject);
router.get('/', getProjects);
router.get('/:id', getProjectById);
router.delete('/:id', deleteProject);

// Destination routes
router.post('/:projectId/destinations', createDestination);
router.put('/destinations/:id', updateDestination);
router.delete('/destinations/:id', deleteDestination);

export default router;




