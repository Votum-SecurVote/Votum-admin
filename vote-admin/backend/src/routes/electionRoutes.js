import express from 'express';
import {
  createElection,
  createBallot,
  getActiveElections,
  getElectionById,
  publishElection,
  unpublishElection,
  getAdminElections,
  deleteElection,
} from '../controllers/electionController.js';
import { authenticateJWT, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// ADMIN-ONLY endpoints
router.post('/elections', authenticateJWT, requireAdmin, createElection);
router.post('/elections/:electionId/ballots', authenticateJWT, requireAdmin, createBallot);
router.post('/elections/:id/publish', authenticateJWT, requireAdmin, publishElection);
router.post('/elections/:id/unpublish', authenticateJWT, requireAdmin, unpublishElection);
router.delete('/elections/:id', authenticateJWT, requireAdmin, deleteElection);

// Admin listing endpoint – includes drafts/unpublished
router.get('/elections/admin', authenticateJWT, requireAdmin, getAdminElections);

// Public/read-only endpoints
// Returns only elections that are published/active (no drafts for voters/observers)
router.get('/elections/active', getActiveElections);
router.get('/elections/:id', getElectionById);

export default router;
