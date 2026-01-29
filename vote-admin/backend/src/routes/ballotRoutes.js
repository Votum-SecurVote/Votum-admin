import express from 'express';
import { authenticateJWT, requireAdmin } from '../middleware/auth.js';
import {
  getElectionBallots,
  publishBallot,
  unpublishBallot,
  rollbackBallot,
} from '../controllers/ballotController.js';

const router = express.Router();

// List all ballot versions for an election (ADMIN only)
router.get('/elections/:electionId/ballots', authenticateJWT, requireAdmin, getElectionBallots);

// Publish a ballot version
router.post('/ballots/:ballotId/publish', authenticateJWT, requireAdmin, publishBallot);

// Unpublish a ballot version
router.post('/ballots/:ballotId/unpublish', authenticateJWT, requireAdmin, unpublishBallot);

// Rollback ballot to a previous version
router.post('/ballots/:ballotId/rollback', authenticateJWT, requireAdmin, rollbackBallot);

export default router;
