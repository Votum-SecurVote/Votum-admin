import asyncHandler from 'express-async-handler';
import Ballot from '../models/Ballot.js';
import Election from '../models/Election.js';
import auditService from '../services/auditService.js';

// @desc    Get all ballot versions for an election (ADMIN only)
// @route   GET /api/elections/:electionId/ballots
export const getElectionBallots = asyncHandler(async (req, res) => {
  const { electionId } = req.params;

  const election = await Election.findById(electionId);
  if (!election) {
    res.status(404);
    throw new Error('Election not found');
  }

  const ballots = await Ballot.find({ electionId })
    .sort({ version: 1 })
    .lean();

  res.json({ success: true, data: ballots });
});

// @desc    Publish a specific ballot version
// @route   POST /api/ballots/:ballotId/publish
export const publishBallot = asyncHandler(async (req, res) => {
  const { ballotId } = req.params;

  const ballot = await Ballot.findById(ballotId);
  if (!ballot) {
    res.status(404);
    throw new Error('Ballot not found');
  }

  const election = await Election.findById(ballot.electionId);
  if (!election) {
    res.status(404);
    throw new Error('Election not found');
  }

  if (!ballot.options || ballot.options.length < 2) {
    res.status(400);
    throw new Error('Ballot must have at least 2 candidates');
  }

  // Do not allow publishing for ended elections
  if (new Date() > new Date(election.endDate)) {
    res.status(400);
    throw new Error('Cannot publish ballot for an ended election');
  }

  // Only one published ballot per election
  await Ballot.updateMany(
    { electionId: ballot.electionId, isPublished: true },
    { isPublished: false }
  );

  ballot.isPublished = true;
  await ballot.save();

  // Sync election with this ballot's options for fast read access
  election.candidates = ballot.options.map((opt, index) => ({
    id: opt._id?.toString() || `candidate_${index}`,
    name: opt.name,
    party: opt.party || '',
    description: opt.description || '',
    order: typeof opt.order === 'number' ? opt.order : index,
  }));

  election.isPublished = true;
  const now = new Date();
  if (now >= new Date(election.endDate)) {
    election.status = 'ended';
  } else if (now >= new Date(election.startDate)) {
    election.status = 'active';
  } else {
    election.status = 'published';
  }

  await election.save();

  auditService.log('BALLOT_PUBLISHED', {
    electionId: election._id,
    ballotId: ballot._id,
    version: ballot.version,
    performedBy: req.user?.id || 'UNKNOWN',
  });

  res.json({ success: true, data: ballot });
});

// @desc    Unpublish the currently published ballot
// @route   POST /api/ballots/:ballotId/unpublish
export const unpublishBallot = asyncHandler(async (req, res) => {
  const { ballotId } = req.params;

  const ballot = await Ballot.findById(ballotId);
  if (!ballot) {
    res.status(404);
    throw new Error('Ballot not found');
  }

  const election = await Election.findById(ballot.electionId);
  if (!election) {
    res.status(404);
    throw new Error('Election not found');
  }

  // Cannot unpublish after election start
  if (new Date() >= new Date(election.startDate)) {
    res.status(400);
    throw new Error('Cannot unpublish ballot after election has started');
  }

  ballot.isPublished = false;
  await ballot.save();

  // If there are no other published ballots, mark election as draft
  const otherPublishedCount = await Ballot.countDocuments({
    electionId: ballot.electionId,
    isPublished: true,
  });

  if (otherPublishedCount === 0) {
    election.isPublished = false;
    election.status = 'draft';
    election.candidates = [];
    await election.save();
  }

  auditService.log('BALLOT_UNPUBLISHED', {
    electionId: election._id,
    ballotId: ballot._id,
    version: ballot.version,
    performedBy: req.user?.id || 'UNKNOWN',
  });

  res.json({ success: true, data: ballot });
});

// @desc    Rollback published ballot to a previous version
// @route   POST /api/ballots/:ballotId/rollback
// @body    { targetVersion: Number }
export const rollbackBallot = asyncHandler(async (req, res) => {
  const { ballotId } = req.params;
  const { targetVersion } = req.body;

  if (typeof targetVersion !== 'number') {
    res.status(400);
    throw new Error('targetVersion is required');
  }

  const current = await Ballot.findById(ballotId);
  if (!current) {
    res.status(404);
    throw new Error('Ballot not found');
  }

  const election = await Election.findById(current.electionId);
  if (!election) {
    res.status(404);
    throw new Error('Election not found');
  }

  // Admin can rollback published elections if there's a discrepancy
  // Only prevent rollback for ended elections
  if (new Date() > new Date(election.endDate)) {
    res.status(400);
    throw new Error('Cannot rollback after election has ended');
  }

  const target = await Ballot.findOne({
    electionId: current.electionId,
    version: targetVersion,
  });

  if (!target) {
    res.status(404);
    throw new Error(`Ballot version ${targetVersion} not found`);
  }

  // Mark all ballots unpublished and publish target
  await Ballot.updateMany(
    { electionId: current.electionId, isPublished: true },
    { isPublished: false }
  );

  target.isPublished = true;
  await target.save();

  // Sync election candidates from target
  election.candidates = target.options.map((opt, index) => ({
    id: opt._id?.toString() || `candidate_${index}`,
    name: opt.name,
    party: opt.party || '',
    description: opt.description || '',
    order: typeof opt.order === 'number' ? opt.order : index,
  }));
  election.isPublished = true;
  
  // Update status based on current time
  const now = new Date();
  if (now >= new Date(election.endDate)) {
    election.status = 'ended';
  } else if (now >= new Date(election.startDate)) {
    election.status = 'active';
  } else {
    election.status = 'published';
  }
  
  await election.save();

  auditService.log('BALLOT_ROLLBACK', {
    electionId: election._id,
    ballotId: target._id,
    version: target.version,
    performedBy: req.user?.id || 'UNKNOWN',
  });

  res.json({ success: true, data: target });
});
