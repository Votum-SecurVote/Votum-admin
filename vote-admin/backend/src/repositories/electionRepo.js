import pool from '../lib/db.js';

export const create = async (data) => {
  const { rows } = await pool.query(
    `INSERT INTO elections (title, description, start_date, end_date, voting_rules, status, is_published, candidates)
     VALUES ($1, $2, $3::timestamptz, $4::timestamptz, $5, $6, $7, $8::jsonb)
     RETURNING *`,
    [
      data.title,
      data.description ?? '',
      data.start_date,
      data.end_date,
      data.voting_rules ?? '',
      data.status ?? 'draft',
      data.is_published ?? false,
      JSON.stringify(data.candidates ?? []),
    ]
  );
  const row = rows[0];
  return row ? { ...row, candidates: row.candidates ?? [] } : null;
};

export const getById = async (id) => {
  const { rows } = await pool.query(
    'SELECT * FROM elections WHERE id = $1',
    [id]
  );
  const row = rows[0];
  return row ? { ...row, candidates: row.candidates ?? [] } : null;
};

export const update = async (id, updates) => {
  const keys = Object.keys(updates).filter((k) => updates[k] !== undefined);
  if (keys.length === 0) return;

  const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
  const values = keys.map((k) =>
    k === 'candidates' ? JSON.stringify(updates[k]) : updates[k]
  );

  await pool.query(
    `UPDATE elections SET ${setClause} WHERE id = $${keys.length + 1}`,
    [...values, id]
  );
};

export const getAll = async () => {
  const { rows } = await pool.query(
    'SELECT * FROM elections ORDER BY created_at DESC'
  );
  return rows.map((r) => ({ ...r, candidates: r.candidates ?? [] }));
};

export const getPublished = async () => {
  const { rows } = await pool.query(
    `SELECT * FROM elections WHERE is_published = true ORDER BY start_date ASC`
  );
  return rows.map((r) => ({ ...r, candidates: r.candidates ?? [] }));
};

export const getActive = async () => {
  const now = new Date().toISOString();
  const { rows } = await pool.query(
    `SELECT * FROM elections
     WHERE is_published = true AND start_date <= $1::timestamptz AND end_date > $1::timestamptz
     ORDER BY start_date ASC`,
    [now]
  );
  return rows.map((r) => ({ ...r, candidates: r.candidates ?? [] }));
};

export const getPublishedById = async (id) => {
  const { rows } = await pool.query(
    'SELECT * FROM elections WHERE id = $1 AND is_published = true',
    [id]
  );
  const row = rows[0];
  return row ? { ...row, candidates: row.candidates ?? [] } : null;
};

export const remove = async (id) => {
  await pool.query('DELETE FROM elections WHERE id = $1', [id]);
};

export const deleteElection = remove;
