import pool from '../lib/db.js';

const log = async (action, payload) => {
  await pool.query(
    `INSERT INTO audit_logs (action, entity_id, metadata, performed_by)
     VALUES ($1, $2, $3::jsonb, $4)`,
    [
      action,
      payload.electionId || payload.ballotId,
      JSON.stringify(payload),
      payload.performedBy,
    ]
  );
};

export default { log };
