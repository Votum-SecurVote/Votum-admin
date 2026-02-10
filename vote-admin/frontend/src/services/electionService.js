/**
 * UI-only mock election + ballot service.
 *
 * This is deliberately implemented without any HTTP calls so the
 * admin UI works completely without a backend. The API surface
 * matches what the components expect (methods and return shape),
 * so your backend teammate can later replace these implementations
 * with real axios calls.
 *
 * Key areas to show:
 *  - createElection → where new elections are created
 *  - createBallot   → where new ballot versions are created
 *  - deleteElection / deleteBallot → where removal happens
 */

// Simple in‑memory store for this tab/session
let elections = [];
const ballotsByElection = {}; // electionId -> ballot[]

// Helper to generate IDs
const makeId = () =>
  (typeof crypto !== 'undefined' && crypto.randomUUID)
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

// Seed with one demo election + ballot so the dashboard isn't empty
(() => {
  const now = new Date();
  const start = new Date(now.getTime() - 60 * 60 * 1000); // 1h ago
  const end = new Date(now.getTime() + 2 * 60 * 60 * 1000); // +2h

  const electionId = makeId();
  const demoElection = {
    _id: electionId,
    title: 'Demo Election for Ballot Designer',
    description: 'Static mock election so you can design ballots without any backend or database.',
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    votingRules: 'Pick exactly one candidate.',
    // Keep this in draft so Ballot Designer can always create new versions
    isPublished: false,
    candidates: [
      { name: 'Alice Johnson', party: 'Unity Party', description: 'Focus on transparency and student wellbeing.' },
      { name: 'Rahul Verma', party: 'Progressive Front', description: 'Tech upgrades and better campus services.' },
      { name: 'Sara Lee', party: 'Green Campus', description: 'Sustainability and mental health focus.' },
    ],
  };

  elections.push(demoElection);

  const ballotId = makeId();
  ballotsByElection[electionId] = [
    {
      id: ballotId,
      version: 1,
      isPublished: true,
      title: 'Main Ballot',
      description: 'Choose exactly one candidate.',
      createdAt: now.toISOString(),
      options: demoElection.candidates.map((c) => ({
        name: c.name,
        party: c.party,
      })),
    },
  ];
})();

const findElection = (id) => elections.find((e) => e._id === id || e.id === id) || null;

const getBallotsArray = (electionId) => {
  if (!ballotsByElection[electionId]) ballotsByElection[electionId] = [];
  return ballotsByElection[electionId];
};

export const electionService = {
  // ----- Election APIs -----
  // createElection – used by Step 1 "Create Election" form
  // to store title/description and the IST start/end dates.
  createElection: async (data) => {
    const id = makeId();
    const created = {
      _id: id,
      title: data.title,
      description: data.description ?? '',
      startDate: data.startDate,
      endDate: data.endDate,
      votingRules: data.votingRules ?? '',
      isPublished: false,
      candidates: [],
    };
    elections.push(created);
    return { data: created };
  },

  getElection: async (id) => {
    const election = findElection(id);
    if (!election) {
      throw new Error('Election not found');
    }
    return { data: election };
  },

  getActiveElections: async () => {
    const now = Date.now();
    const active = elections.filter((e) => {
      const start = new Date(e.startDate).getTime();
      const end = new Date(e.endDate).getTime();
      return e.isPublished && now >= start && now <= end;
    });
    return { data: active };
  },

  getAdminElections: async () => {
    // For UI-only mode, just return all elections
    return { data: elections.slice() };
  },

  publishElection: async (id) => {
    const e = findElection(id);
    if (!e) throw new Error('Election not found');
    e.isPublished = true;
    return { data: e };
  },

  unpublishElection: async (id) => {
    const e = findElection(id);
    if (!e) throw new Error('Election not found');
    e.isPublished = false;
    return { data: e };
  },

  deleteElection: async (id) => {
    elections = elections.filter((e) => (e._id || e.id) !== id);
    delete ballotsByElection[id];
    return { data: { success: true } };
  },

  // ----- Ballot APIs (versioned by election) -----
  // createBallot – used by Step 2 "Ballot Designer" to create
  // a new ballot version including candidates + party logos.
  createBallot: async (electionId, data) => {
    const election = findElection(electionId);
    if (!election) throw new Error('Election not found');

    const ballots = getBallotsArray(electionId);
    const nextVersion = ballots.length
      ? Math.max(...ballots.map((b) => b.version || 0)) + 1
      : 1;

    const id = makeId();
    const created = {
      id,
      version: nextVersion,
      isPublished: false,
      title: data.title ?? `Ballot v${nextVersion}`,
      description: data.description ?? '',
      createdAt: new Date().toISOString(),
      options: data.options ?? [],
    };

    ballots.push(created);

    // Keep election.candidates in sync with the latest ballot options
    if (Array.isArray(created.options) && created.options.length > 0) {
      election.candidates = created.options.map((opt) => ({
        name: opt.name,
        party: opt.party,
        description: opt.description,
        imageUrl: opt.imageUrl || null,
      }));
    }

    return { data: created };
  },

  getElectionBallots: async (electionId) => {
    const ballots = getBallotsArray(electionId);
    return { data: ballots.slice() };
  },

  // deleteBallot – used in Step 3 "Election View" to remove
  // a specific ballot version from the history list.
  deleteBallot: async (ballotId) => {
    for (const [electionId, ballots] of Object.entries(ballotsByElection)) {
      const index = ballots.findIndex((b) => b.id === ballotId);
      if (index !== -1) {
        ballots.splice(index, 1);

        // Resync candidates on the election to the latest published or last ballot
        const election = findElection(electionId);
        if (election) {
          const latest = ballots[ballots.length - 1];
          if (latest && Array.isArray(latest.options)) {
            election.candidates = latest.options.map((opt) => ({
              name: opt.name,
              party: opt.party,
              description: opt.description,
              imageUrl: opt.imageUrl || null,
            }));
          } else {
            election.candidates = [];
          }
        }

        return { data: { success: true } };
      }
    }
    throw new Error('Ballot not found');
  },

  publishBallot: async (ballotId) => {
    // Only one published ballot per election in this mock
    for (const [electionId, ballots] of Object.entries(ballotsByElection)) {
      for (const b of ballots) {
        if (b.id === ballotId) {
          ballots.forEach((x) => {
            x.isPublished = x.id === ballotId;
          });
          return { data: b };
        }
      }
    }
    throw new Error('Ballot not found');
  },

  unpublishBallot: async (ballotId) => {
    for (const ballots of Object.values(ballotsByElection)) {
      const b = ballots.find((x) => x.id === ballotId);
      if (b) {
        b.isPublished = false;
        return { data: b };
      }
    }
    throw new Error('Ballot not found');
  },

  rollbackBallot: async (ballotId, targetVersion) => {
    for (const [electionId, ballots] of Object.entries(ballotsByElection)) {
      const target = ballots.find((b) => b.version === targetVersion);
      if (!target) continue;

      const nextVersion = ballots.length
        ? Math.max(...ballots.map((b) => b.version || 0)) + 1
        : targetVersion + 1;

      const id = makeId();
      const cloned = {
        ...target,
        id,
        version: nextVersion,
        isPublished: false,
        createdAt: new Date().toISOString(),
      };

      ballots.push(cloned);

      // Also sync candidates on the parent election
      const election = findElection(electionId);
      if (election && Array.isArray(cloned.options)) {
        election.candidates = cloned.options.map((opt) => ({
          name: opt.name,
          party: opt.party,
          description: opt.description,
          imageUrl: opt.imageUrl || null,
        }));
      }

      return { data: cloned };
    }
    throw new Error('Ballot or version not found');
  },
};

export default electionService;
