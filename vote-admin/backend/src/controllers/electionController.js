import asyncHandler from 'express-async-handler';
import Election from '../models/Election.js';
import Ballot from '../models/Ballot.js';
import auditService from '../services/auditService.js';

// @desc    Create new election (ADMIN only via middleware)
// @route   POST /api/elections
export const createElection = asyncHandler(async (req, res) => {
  const { title, description, startDate, endDate, votingRules } = req.body;

  // Validate required fields
  if (!title || !startDate || !endDate) {
    res.status(400);
    throw new Error('Title, start date, and end date are required');
  }

  // Validate title length
  if (title.trim().length === 0 || title.trim().length > 200) {
    res.status(400);
    throw new Error('Title must be between 1 and 200 characters');
  }

  // Validate dates
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (isNaN(start) || isNaN(end) || end <= start) {
    res.status(400);
    throw new Error('Invalid election schedule: end date must be after start date');
  }

  // Validate that start date is in the future (for draft elections)
  const now = new Date();
  if (start < now) {
    res.status(400);
    throw new Error('Start date must be in the future');
  }

  // Validate description length if provided
  if (description && description.length > 1000) {
    res.status(400);
    throw new Error('Description must be less than 1000 characters');
  }

  let election;
  try {
    election = await Election.create({
      title: title.trim(),
      description: description?.trim() || '',
      startDate: start,
      endDate: end,
      votingRules: votingRules?.trim() || '',
      status: 'draft',
      isPublished: false,
    });

    auditService.log('ELECTION_CREATED', {
      electionId: election._id,
      title: election.title,
      status: election.status,
      performedBy: req.user?.id || 'UNKNOWN',
    });

    res.status(201).json({
      success: true,
      data: election
    });
  } catch (error) {
    // If election was created but validation failed, delete it
    if (election && election._id) {
      try {
        await Election.findByIdAndDelete(election._id);
      } catch (deleteError) {
        console.error('Error rolling back election creation:', deleteError);
      }
    }
    // Re-throw the error
    throw error;
  }
});

// @desc    Create ballot for election (ADMIN only via middleware)
// @route   POST /api/elections/:electionId/ballots
export const createBallot = asyncHandler(async (req, res) => {
  const { electionId } = req.params;
  const { title, description, options, maxSelections } = req.body;

  // Basic validation
  if (!options || !Array.isArray(options) || options.length === 0) {
    res.status(400);
    throw new Error('Ballot must have at least one option');
  }

  // Validate required fields for each option
  for (const opt of options) {
    if (!opt.name || !opt.name.trim()) {
      res.status(400);
      throw new Error('All candidates must have a name');
    }
    if (!opt.party || !opt.party.trim()) {
      res.status(400);
      throw new Error('All candidates must have a party');
    }
  }

  // Enforce unique combination of name AND party (case-insensitive)
  const optionKeys = options.map((opt) => 
    `${opt.name?.trim().toLowerCase()}_${opt.party?.trim().toLowerCase()}`
  );
  const hasDuplicates = new Set(optionKeys).size !== optionKeys.length;
  if (hasDuplicates) {
    res.status(400);
    throw new Error('Invalid ballot: Duplicate candidate with same name and same party name. Please enter again.');
  }

  // Check if election exists and is not published or started
  const election = await Election.findById(electionId);
  if (!election) {
    res.status(404);
    throw new Error('Election not found');
  }

  if (election.isPublished) {
    res.status(403);
    throw new Error('Cannot create ballot for published election');
  }

  const now = new Date();
  if (now >= new Date(election.startDate)) {
    res.status(400);
    throw new Error('Cannot edit ballot after election has started');
  }

  // Determine next version number for this election's ballot
  const latest = await Ballot.find({ electionId })
    .sort({ version: -1 })
    .limit(1);
  const nextVersion = latest.length ? latest[0].version + 1 : 1;

  const ballot = await Ballot.create({
    electionId,
    version: nextVersion,
    title,
    description,
    options: options.map((opt, index) => ({
      ...opt,
      order: index
    })),
    maxSelections,
    isPublished: false,
  });

  // Update election with candidates for quick read access
  election.candidates = options.map((opt, index) => ({
    id: opt.id || `candidate_${Date.now()}_${index}`,
    name: opt.name,
    party: opt.party || '',
    description: opt.description || '',
    order: index
  }));

  await election.save();

  auditService.log('BALLOT_CREATED', {
    electionId: election._id,
    ballotId: ballot._id,
    title: ballot.title,
    performedBy: req.user?.id || 'UNKNOWN',
  });

  res.status(201).json({
    success: true,
    data: ballot
  });
});

// @desc    Get public elections (no drafts)
// @route   GET /api/elections/active
export const getActiveElections = asyncHandler(async (req, res) => {
  const elections = await Election.find({
    isPublished: true,
  }).sort({ startDate: 1 });

  res.json({
    success: true,
    data: elections
  });
});

// @desc    Get all elections for admin (includes drafts/unpublished)
// @route   GET /api/elections/admin
// @access  ADMIN (enforced by middleware)
export const getAdminElections = asyncHandler(async (req, res) => {
  const elections = await Election.find({}).sort({ createdAt: -1 }); // Sort by creation date, newest first
  
  // Update status based on current time for accurate display
  const now = new Date();
  const updatedElections = elections.map(election => {
    // Ensure draft elections have status set
    if (!election.isPublished && !election.status) {
      election.status = 'draft';
    }
    
    if (election.isPublished) {
      if (now >= new Date(election.endDate)) {
        election.status = 'ended';
      } else if (now >= new Date(election.startDate)) {
        election.status = 'active';
      } else {
        election.status = 'published';
      }
      // Save status update
      election.save().catch(err => console.error('Error saving election status:', err));
    }
    
    return election;
  });

  res.json({
    success: true,
    data: updatedElections,
  });
});

// @desc    Get election by ID (public only returns published elections)
// @route   GET /api/elections/:id
export const getElectionById = asyncHandler(async (req, res) => {
  const election = await Election.findOne({
    _id: req.params.id,
    isPublished: true,
  });
  
  if (!election) {
    res.status(404);
    throw new Error('Election not found');
  }

  res.json({
    success: true,
    data: election
  });
});

// @desc    Publish election
// @route   POST /api/elections/:id/publish
export const publishElection = asyncHandler(async (req, res) => {
  const election = await Election.findById(req.params.id);
  
  if (!election) {
    res.status(404);
    throw new Error('Election not found');
  }

  if (election.status === 'ended') {
    res.status(403);
    throw new Error('Cannot publish ended election');
  }

  // Check if ballot has at least 2 candidates
  if (election.candidates.length < 2) {
    res.status(400);
    throw new Error('Ballot must have at least 2 candidates');
  }

  election.isPublished = true;
  election.status = new Date() >= new Date(election.startDate) ? 'active' : 'published';
  await election.save();

  auditService.log('ELECTION_PUBLISHED', {
    electionId: election._id,
    title: election.title,
    status: election.status,
    performedBy: req.user?.id || 'UNKNOWN',
  });

  res.json({
    success: true,
    data: election
  });
});

// @desc    Unpublish election
// @route   POST /api/elections/:id/unpublish
export const unpublishElection = asyncHandler(async (req, res) => {
  const election = await Election.findById(req.params.id);
  
  if (!election) {
    res.status(404);
    throw new Error('Election not found');
  }

  // Check if election has started
  if (new Date() >= new Date(election.startDate)) {
    res.status(403);
    throw new Error('Cannot unpublish election after start time');
  }

  election.isPublished = false;
  election.status = 'draft';
  await election.save();

  auditService.log('ELECTION_UNPUBLISHED', {
    electionId: election._id,
    title: election.title,
    status: election.status,
    performedBy: req.user?.id || 'UNKNOWN',
  });

  res.json({
    success: true,
    data: election
  });
});

// @desc    Delete election (ADMIN only)
// @route   DELETE /api/elections/:id
export const deleteElection = asyncHandler(async (req, res) => {
  const election = await Election.findById(req.params.id);
  
  if (!election) {
    res.status(404);
    throw new Error('Election not found');
  }

  // Admin can delete any election at their convenience
  // Delete associated ballots
  const Ballot = (await import('../models/Ballot.js')).default;
  await Ballot.deleteMany({ electionId: election._id });

  // Delete the election
  await Election.findByIdAndDelete(req.params.id);

  auditService.log('ELECTION_DELETED', {
    electionId: election._id,
    title: election.title,
    status: election.status,
    performedBy: req.user?.id || 'UNKNOWN',
  });

  res.json({
    success: true,
    message: 'Election deleted successfully'
  });
});