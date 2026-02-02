/**
 * Election response normalization and status computation.
 * All timestamps in DB are stored in UTC; status is computed using current UTC time.
 */

/**
 * Compute election status from is_published and UTC timestamps.
 * Status: draft → published → active → ended (based on current UTC time).
 */
function computeStatus(election) {
  if (!election.is_published) return 'draft';
  const now = Date.now();
  const start = new Date(election.start_date).getTime();
  const end = new Date(election.end_date).getTime();
  if (now >= end) return 'ended';
  if (now >= start) return 'active';
  return 'published';
}

/**
 * Normalize Supabase row to API shape: id→_id, snake_case→camelCase.
 * Timestamps (start_date, end_date, created_at) stay as ISO strings (UTC).
 */
function normalizeElection(row) {
  if (!row) return null;
  const status = computeStatus(row);
  return {
    _id: row.id,
    title: row.title,
    description: row.description ?? '',
    startDate: row.start_date,
    endDate: row.end_date,
    createdAt: row.created_at,
    isPublished: !!row.is_published,
    status,
    votingRules: row.voting_rules ?? '',
    candidates: row.candidates ?? [],
  };
}

/**
 * Normalize array of elections for API response.
 */
function normalizeElections(rows) {
  return (rows || []).map(normalizeElection).filter(Boolean);
}

export { computeStatus, normalizeElection, normalizeElections };
