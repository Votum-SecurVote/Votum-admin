// controllers/voterController.js
import Voter from '../models/Voter.js';
import AuditLog from '../models/AuditLog.js';
import { hashIdentityProof } from '../utils/hashUtils.js';

export async function registerVoter(req, res) {
  try {
    const { identityProof } = req.body;

    if (typeof identityProof !== 'string' || !identityProof.trim()) {
      return res.status(400).json({ message: 'Identity proof required' });
    }

    if (req.user.role === 'ADMIN') {
      return res.status(403).json({ message: 'Admin cannot register as voter' });
    }

    // Check if this user already has a voter registration
    const existingVoterByUser = await Voter.findOne({ userId: req.user.id });
    if (existingVoterByUser) {
      return res.status(409).json({ message: 'Already registered with this account' });
    }

    const identityProofHash = hashIdentityProof(identityProof);

    // Check if this identity proof has already been used by any account
    const existingVoterByIdentity = await Voter.findOne({ identityProofHash });
    if (existingVoterByIdentity) {
      return res.status(409).json({ message: 'This identity is already registered.' });
    }

    const voter = await Voter.create({
      userId: req.user.id,
      identityProofHash,
      status: 'PENDING',
    });

    await AuditLog.create({
      action: 'VOTER_REGISTER',
      actorId: req.user.id,
      targetId: voter._id,
      role: req.user.role,
    });

    return res.status(201).json({
      message: 'Registration successful. Waiting for admin approval.',
      voterId: voter._id,
      status: 'PENDING',
    });
  } catch (error) {
    if (error && error.code === 11000) {
      return res.status(409).json({ message: 'This identity is already registered.' });
    }

    return res.status(500).json({ message: 'Server error' });
  }
}

export async function getMyVoterStatus(req, res) {
  try {
    const voter = await Voter.findOne({ userId: req.user.id }).select('status');

    if (!voter) {
      return res.status(404).json({ message: 'Not registered' });
    }

    return res.status(200).json({ status: voter.status });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
}
