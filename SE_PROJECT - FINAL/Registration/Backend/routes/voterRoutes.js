import { Router } from 'express';
import mongoose from 'mongoose';
import { registerVoter, getMyVoterStatus } from '../controllers/voterController.js';

const router = Router();

router.post(
  '/voters/register',
  (req, res, next) => {
    const headerValue = req.headers['x-user-id'];

    if (typeof headerValue !== 'string' || !headerValue.trim()) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userId = headerValue.trim();

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }

    req.user = {
      id: new mongoose.Types.ObjectId(userId),
      role: 'VOTER',
    };

    next();
  },
  registerVoter
);

router.get(
  '/voters/me',
  (req, res, next) => {
    const headerValue = req.headers['x-user-id'];

    if (typeof headerValue !== 'string' || !headerValue.trim()) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userId = headerValue.trim();

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }

    req.user = {
      id: new mongoose.Types.ObjectId(userId),
      role: 'VOTER',
    };

    next();
  },
  getMyVoterStatus
);

export default router;
