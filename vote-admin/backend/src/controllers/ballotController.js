import asyncHandler from 'express-async-handler';
import * as ballotRepo from '../repositories/ballotRepo.js';
import * as electionRepo from '../repositories/electionRepo.js';
import auditService from '../services/auditService.js';

/**
 * @desc    Get all ballot versions for an election (ADMIN only)
 * @route   GET /api/elections/:electionId/ballots
 */
export const getElectionBallots = asyncHandler(async (req, res) => {
  const { electionId } = req.params;

  const election = await electionRepo.getById(electionId);
  if (!election) {
    res.status(404);
    throw new Error('Election not found');
  }

  const ballots = await ballotRepo.getByElection(electionId);

  res.json({ success: true, data: ballots });
});

/**
 * @desc    Publish a specific ballot version
 * @route   POST /api/ballots/:ballotId/publish
 */
export const publishBallot = asyncHandler(async (req, res) => {
  const { ballotId } = req.params;

  const ballot = await ballotRepo.getById(ballotId);
  if (!ballot) {
    res.status(404);
    throw new Error('Ballot not found');
  }

  const election = await electionRepo.getById(ballot.election_id);
  if (!election) {
    res.status(404);
    throw new Error('Election not found');
  }

  if (!ballot.options || ballot.options.length < 2) {
    res.status(400);
    throw new Error('Ballot must have at least 2 candidates');
  }

  // Do not allow publishing after election end
  if (new Date() > new Date(election.end_date)) {
    res.status(400);
    throw new Error('Cannot publish ballot for an ended election');
  }

  // Ensure only one published ballot per election
  await ballotRepo.unpublishAll(ballot.election_id);
  await ballotRepo.publish(ballotId);

  // Sync election candidates for fast reads
  const candidates = ballot.options.map((opt, index) => ({
    id: opt.id || `candidate_${index}`,
    name: opt.name,
    party: opt.party || '',
    description: opt.description || '',
    order: index,
  }));

  const now = new Date();
  let status = 'published';
  if (now >= new Date(election.end_date)) status = 'ended';
  else if (now >= new Date(election.start_date)) status = 'active';

  await electionRepo.update(election.id, {
    candidates,
    is_published: true,
    status,
  });

  await auditService.log('BALLOT_PUBLISHED', {
    electionId: election.id,
    ballotId,
    version: ballot.version,
    performedBy: req.user?.id || 'UNKNOWN',
  });

  res.json({ success: true, data: ballot });
});

/**
 * @desc    Unpublish the currently published ballot
 * @route   POST /api/ballots/:ballotId/unpublish
 */
export const unpublishBallot = asyncHandler(async (req, res) => {
  const { ballotId } = req.params;

  const ballot = await ballotRepo.getById(ballotId);
  if (!ballot) {
    res.status(404);
    throw new Error('Ballot not found');
  }

  const election = await electionRepo.getById(ballot.election_id);
  if (!election) {
    res.status(404);
    throw new Error('Election not found');
  }

  // Cannot unpublish after election start
  if (new Date() >= new Date(election.start_date)) {
    res.status(400);
    throw new Error('Cannot unpublish ballot after election has started');
  }

  // Unpublish this ballot
  await ballotRepo.unpublishAll(ballot.election_id);

  const remainingPublished = await ballotRepo.countPublished(ballot.election_id);

  if (remainingPublished === 0) {
    await electionRepo.update(election.id, {
      is_published: false,
      status: 'draft',
      candidates: [],
    });
  }

  await auditService.log('BALLOT_UNPUBLISHED', {
    electionId: election.id,
    ballotId,
    version: ballot.version,
    performedBy: req.user?.id || 'UNKNOWN',
  });

  res.json({ success: true, data: ballot });
});

/**
 * @desc    Rollback published ballot to a previous version
 * @route   POST /api/ballots/:ballotId/rollback
 * @body    { targetVersion: Number }
 */
export const rollbackBallot = asyncHandler(async (req, res) => {
  const { ballotId } = req.params;
  const { targetVersion } = req.body;

  if (typeof targetVersion !== 'number') {
    res.status(400);
    throw new Error('targetVersion is required');
  }

  const current = await ballotRepo.getById(ballotId);
  if (!current) {
    res.status(404);
    throw new Error('Ballot not found');
  }

  const election = await electionRepo.getById(current.election_id);
  if (!election) {
    res.status(404);
    throw new Error('Election not found');
  }

  // Prevent rollback after election end
  if (new Date() > new Date(election.end_date)) {
    res.status(400);
    throw new Error('Cannot rollback after election has ended');
  }

  const target = await ballotRepo.getByVersion(
    current.election_id,
    targetVersion
  );

  if (!target) {
    res.status(404);
    throw new Error(`Ballot version ${targetVersion} not found`);
  }

  await ballotRepo.unpublishAll(current.election_id);
  await ballotRepo.publish(target.id);

  const candidates = (target.options || []).map((opt, index) => ({
    id: opt.id || `candidate_${index}`,
    name: opt.name,
    party: opt.party || '',
    description: opt.description || '',
    order: index,
  }));

  await electionRepo.update(election.id, {
    candidates,
    is_published: true,
  });

  await auditService.log('BALLOT_ROLLBACK', {
    electionId: election.id,
    ballotId: target.id,
    version: target.version,
    performedBy: req.user?.id || 'UNKNOWN',
  });

  res.json({ success: true, data: target });
});
