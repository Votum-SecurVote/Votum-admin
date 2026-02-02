import dotenv from 'dotenv';
dotenv.config();

import pg from 'pg';
const { Pool } = pg;

const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : new Pool({
      host: process.env.PGHOST || 'localhost',
      port: Number(process.env.PGPORT) || 5432,
      database: process.env.PGDATABASE || 'vote_admin',
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || '',
    });

export const query = (text, params) => pool.query(text, params);
export default pool;
