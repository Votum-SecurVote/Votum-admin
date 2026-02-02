// backend/controllers/adminVoterController.js
import mongoose from 'mongoose';
import Voter from '../models/Voter.js';
import AuditLog from '../models/AuditLog.js';

const ADMIN_ACTOR_ID = new mongoose.Types.ObjectId('000000000000000000000001');

function ensureAdmin(req, res) {
  const role = req.header('x-user-role');
  if (role !== 'ADMIN') {
    res.status(403).json({ message: 'Forbidden' });
    return false;
  }
  return true;
}

export async function getPendingVoters(req, res) {
  if (!ensureAdmin(req, res)) return;

  try {
    const voters = await Voter.find({ status: 'PENDING' }).sort({
      createdAt: 1,
    });

    const payload = voters.map((voter) => ({
      voterId: voter._id.toString(),
      userId: voter.userId,
      status: voter.status,
      createdAt: voter.createdAt,
    }));

    res.json(payload);
  } catch (error) {
    console.error('Error fetching pending voters', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function approveVoter(req, res) {
  if (!ensureAdmin(req, res)) return;

  const { voterId } = req.params;

  try {
    const voter = await Voter.findById(voterId);

    if (!voter) {
      return res.status(404).json({ message: 'Voter not found' });
    }

    if (voter.status !== 'PENDING') {
      return res.status(400).json({ message: 'Voter is not pending' });
    }

    voter.status = 'APPROVED';
    await voter.save();

    await AuditLog.create({
      action: 'VOTER_APPROVED',
      actorId: ADMIN_ACTOR_ID,
      targetId: voter._id,
      role: 'ADMIN',
    });

    return res.json({ success: true });
  } catch (error) {
    console.error('Error approving voter', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function rejectVoter(req, res) {
  if (!ensureAdmin(req, res)) return;

  const { voterId } = req.params;

  try {
    const voter = await Voter.findById(voterId);

    if (!voter) {
      return res.status(404).json({ message: 'Voter not found' });
    }

    if (voter.status !== 'PENDING') {
      return res.status(400).json({ message: 'Voter is not pending' });
    }

    voter.status = 'REJECTED';
    await voter.save();

    await AuditLog.create({
      action: 'VOTER_REJECTED',
      actorId: ADMIN_ACTOR_ID,
      targetId: voter._id,
      role: 'ADMIN',
    });

    return res.json({ success: true });
  } catch (error) {
    console.error('Error rejecting voter', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}