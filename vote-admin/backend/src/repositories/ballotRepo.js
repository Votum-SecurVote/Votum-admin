import pool from '../lib/db.js';

export const getById = async (id) => {
  const { rows } = await pool.query(
    'SELECT * FROM ballots WHERE id = $1',
    [id]
  );
  const row = rows[0];
  return row ? { ...row, options: row.options ?? [] } : null;
};

export const getByElection = async (electionId) => {
  const { rows } = await pool.query(
    'SELECT * FROM ballots WHERE election_id = $1 ORDER BY version ASC',
    [electionId]
  );
  return (rows || []).map((r) => ({ ...r, options: r.options ?? [] }));
};

export const getLatestVersion = async (electionId) => {
  const { rows } = await pool.query(
    'SELECT version FROM ballots WHERE election_id = $1 ORDER BY version DESC LIMIT 1',
    [electionId]
  );
  return rows.length === 0 ? 0 : Number(rows[0].version);
};

export const create = async (ballot) => {
  const { rows } = await pool.query(
    `INSERT INTO ballots (election_id, version, title, description, options, max_selections, is_published)
     VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7)
     RETURNING *`,
    [
      ballot.election_id,
      ballot.version,
      ballot.title ?? '',
      ballot.description ?? '',
      JSON.stringify(ballot.options ?? []),
      ballot.max_selections ?? 1,
      ballot.is_published ?? false,
    ]
  );
  const row = rows[0];
  return row ? { ...row, options: row.options ?? [] } : null;
};

export const unpublishAll = async (electionId) => {
  await pool.query(
    'UPDATE ballots SET is_published = false WHERE election_id = $1',
    [electionId]
  );
};

export const publish = async (id) => {
  await pool.query(
    'UPDATE ballots SET is_published = true WHERE id = $1',
    [id]
  );
};

export const countPublished = async (electionId) => {
  const { rows } = await pool.query(
    'SELECT COUNT(*)::int AS count FROM ballots WHERE election_id = $1 AND is_published = true',
    [electionId]
  );
  return rows[0]?.count ?? 0;
};

export const getByVersion = async (electionId, version) => {
  const { rows } = await pool.query(
    'SELECT * FROM ballots WHERE election_id = $1 AND version = $2',
    [electionId, version]
  );
  const row = rows[0];
  return row ? { ...row, options: row.options ?? [] } : null;
};

export const deleteByElection = async (electionId) => {
  await pool.query('DELETE FROM ballots WHERE election_id = $1', [electionId]);
};
