-- PostgreSQL schema for vote-admin (run once against your database)
-- All timestamps stored in UTC (timestamptz).

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS elections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  voting_rules TEXT DEFAULT '',
  status TEXT DEFAULT 'draft',
  is_published BOOLEAN DEFAULT FALSE,
  candidates JSONB DEFAULT '[]'::jsonb
);

CREATE TABLE IF NOT EXISTS ballots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id UUID NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  title TEXT DEFAULT '',
  description TEXT DEFAULT '',
  options JSONB DEFAULT '[]'::jsonb,
  max_selections INTEGER DEFAULT 1,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(election_id, version)
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  entity_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  performed_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_elections_created_at ON elections(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_elections_is_published ON elections(is_published);
CREATE INDEX IF NOT EXISTS idx_elections_dates ON elections(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_ballots_election_id ON ballots(election_id);
CREATE INDEX IF NOT EXISTS idx_ballots_election_published ON ballots(election_id, is_published);
