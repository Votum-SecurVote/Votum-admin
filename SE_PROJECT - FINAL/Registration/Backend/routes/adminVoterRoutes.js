// backend/routes/adminVoterRoutes.js
import { Router } from 'express';
import {
  getPendingVoters,
  approveVoter,
  rejectVoter,
} from '../controllers/adminVoterController.js';

const router = Router();

router.get('/pending', getPendingVoters);
router.post('/:voterId/approve', approveVoter);
router.post('/:voterId/reject', rejectVoter);

export default router;