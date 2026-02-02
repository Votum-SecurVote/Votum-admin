import asyncHandler from 'express-async-handler';
import * as electionRepo from '../repositories/electionRepo.js';
import * as ballotRepo from '../repositories/ballotRepo.js';
import auditService from '../services/auditService.js';
import { normalizeElection, normalizeElections } from '../utils/electionUtils.js';

/**
 * @desc    Create new election (ADMIN only)
 * @route   POST /api/elections
 */
export const createElection = asyncHandler(async (req, res) => {
  const { title, description, startDate, endDate, votingRules } = req.body;

  if (!title || !startDate || !endDate) {
    res.status(400);
    throw new Error('Title, start date, and end date are required');
  }

  if (title.trim().length === 0 || title.trim().length > 200) {
    res.status(400);
    throw new Error('Title must be between 1 and 200 characters');
  }

  // Parse as UTC (frontend sends ISO strings); store in Supabase as UTC.
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
    res.status(400);
    throw new Error('Invalid election schedule');
  }

  if (start < new Date()) {
    res.status(400);
    throw new Error('Start date must be in the future');
  }

  const election = await electionRepo.create({
    title: title.trim(),
    description: description?.trim() || '',
    start_date: start.toISOString(),
    end_date: end.toISOString(),
    voting_rules: votingRules || '',
    status: 'draft',
    is_published: false,
    candidates: [],
  });

  await auditService.log('ELECTION_CREATED', {
    electionId: election.id,
    title: election.title,
    status: election.status,
    performedBy: req.user?.id || 'UNKNOWN',
  });

  res.status(201).json({ success: true, data: normalizeElection(election) });
});

/**
 * @desc    Create ballot for election (ADMIN only)
 * @route   POST /api/elections/:electionId/ballots
 */
export const createBallot = asyncHandler(async (req, res) => {
  const { electionId } = req.params;
  const { title, description, options, maxSelections } = req.body;

  if (!Array.isArray(options) || options.length < 2) {
    res.status(400);
    throw new Error('Ballot must have at least 2 candidates');
  }

  const uniqueCheck = new Set(
    options.map(o => `${o.name?.toLowerCase()}_${o.party?.toLowerCase()}`)
  );
  if (uniqueCheck.size !== options.length) {
    res.status(400);
    throw new Error('Duplicate candidate with same name and party');
  }

  const election = await electionRepo.getById(electionId);
  if (!election) {
    res.status(404);
    throw new Error('Election not found');
  }

  // ✅ FIX: use STATUS, not TIME
  if (election.status !== 'draft') {
    res.status(400);
    throw new Error('Cannot edit ballot after election is published');
  }

  const latestVersion = await ballotRepo.getLatestVersion(electionId);
  const nextVersion = latestVersion + 1;

  const ballot = await ballotRepo.create({
    election_id: electionId,
    version: nextVersion,
    title,
    description,
    options: options.map((opt, i) => ({ ...opt, order: i })),
    max_selections: maxSelections,
    is_published: false,
  });

  await electionRepo.update(electionId, {
    candidates: options.map((opt, i) => ({
      id: `candidate_${i}`,
      name: opt.name,
      party: opt.party,
      description: opt.description || '',
      order: i,
    })),
  });

  await auditService.log('BALLOT_CREATED', {
    electionId,
    ballotId: ballot.id,
    title: ballot.title,
    performedBy: req.user?.id || 'UNKNOWN',
  });

  res.status(201).json({ success: true, data: ballot });
});

/**
 * @desc    Get public elections (only ACTIVE: is_published AND start <= now < end, UTC).
 * @route   GET /api/elections/active
 */
export const getActiveElections = asyncHandler(async (_req, res) => {
  const elections = await electionRepo.getActive();
  res.json({ success: true, data: normalizeElections(elections) });
});

/**
 * @desc    Get all elections for admin (all statuses; normalized with computed status).
 * @route   GET /api/elections/admin
 */
export const getAdminElections = asyncHandler(async (_req, res) => {
  const elections = await electionRepo.getAll();
  res.json({ success: true, data: normalizeElections(elections) });
});

/**
 * @desc    Get election by ID (public; only if published).
 * @route   GET /api/elections/:id
 */
export const getElectionById = asyncHandler(async (req, res) => {
  const election = await electionRepo.getPublishedById(req.params.id);
  if (!election) {
    res.status(404);
    throw new Error('Election not found');
  }
  res.json({ success: true, data: normalizeElection(election) });
});

/**
 * @desc    Publish election
 * @route   POST /api/elections/:id/publish
 */
export const publishElection = asyncHandler(async (req, res) => {
  const election = await electionRepo.getById(req.params.id);
  if (!election) throw new Error('Election not found');

  if (election.candidates.length < 2) {
    throw new Error('Ballot must have at least 2 candidates');
  }

  // Status is computed on read from UTC time; store for DB consistency.
  const now = Date.now();
  const start = new Date(election.start_date).getTime();
  const end = new Date(election.end_date).getTime();
  const status = now >= end ? 'ended' : now >= start ? 'active' : 'published';

  await electionRepo.update(election.id, {
    is_published: true,
    status,
  });

  await auditService.log('ELECTION_PUBLISHED', {
    electionId: election.id,
    performedBy: req.user?.id || 'UNKNOWN',
  });

  res.json({ success: true });
});
/**
 * @desc    Unpublish election
 * @route   POST /api/elections/:id/unpublish
 */
export const unpublishElection = asyncHandler(async (req, res) => {
  const election = await electionRepo.getById(req.params.id);
  if (!election) {
    res.status(404);
    throw new Error('Election not found');
  }

  // Cannot unpublish once election has started
  if (new Date() >= new Date(election.start_date)) {
    res.status(400);
    throw new Error('Cannot unpublish election after start time');
  }

  await electionRepo.update(election.id, {
    is_published: false,
    status: 'draft',
    candidates: [],
  });

  await auditService.log('ELECTION_UNPUBLISHED', {
    electionId: election.id,
    performedBy: req.user?.id || 'UNKNOWN',
  });

  res.json({ success: true });
});

/**
 * @desc    Delete election
 * @route   DELETE /api/elections/:id
 */
export const deleteElection = asyncHandler(async (req, res) => {
  await ballotRepo.deleteByElection(req.params.id);
  await electionRepo.remove(req.params.id);

  await auditService.log('ELECTION_DELETED', {
    electionId: req.params.id,
    performedBy: req.user?.id || 'UNKNOWN',
  });

  res.json({ success: true, message: 'Election deleted successfully' });
});

