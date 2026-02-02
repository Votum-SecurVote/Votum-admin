-- Complete schema for vote-admin (ERD + frontend columns)
-- Run once: psql -d vote_admin -f schema.sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Users
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT,
    mfa_enabled BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Roles
CREATE TABLE IF NOT EXISTS roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE
);

-- 3. User Roles (junction)
CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    role_id INTEGER NOT NULL REFERENCES roles(role_id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- 4. Identity Verification
CREATE TABLE IF NOT EXISTS identity_verification (
    verification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    encrypted_id_document TEXT,
    verification_status VARCHAR(50),
    verified_at TIMESTAMPTZ
);

-- 5. Elections (with frontend columns)
CREATE TABLE IF NOT EXISTS elections (
    election_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status VARCHAR(50) DEFAULT 'draft',
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    voting_rules TEXT
);

-- 6. Ballots (with frontend columns)
CREATE TABLE IF NOT EXISTS ballots (
    ballot_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    election_id UUID NOT NULL REFERENCES elections(election_id) ON DELETE CASCADE,
    version INTEGER NOT NULL,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    title TEXT,
    description TEXT,
    max_selections INTEGER DEFAULT 1,
    UNIQUE(election_id, version)
);

-- 7. Candidates (with frontend columns)
CREATE TABLE IF NOT EXISTS candidates (
    candidate_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ballot_id UUID NOT NULL REFERENCES ballots(ballot_id) ON DELETE CASCADE,
    candidate_name VARCHAR(255) NOT NULL,
    description TEXT,
    party VARCHAR(255)
);

-- 8. Votes
CREATE TABLE IF NOT EXISTS votes (
    vote_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    election_id UUID NOT NULL REFERENCES elections(election_id) ON DELETE CASCADE,
    encrypted_vote TEXT,
    nullifier_hash VARCHAR(255),
    cast_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Vote Receipts
CREATE TABLE IF NOT EXISTS vote_receipts (
    receipt_hash VARCHAR(255) PRIMARY KEY,
    election_id UUID NOT NULL REFERENCES elections(election_id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Tally Results
CREATE TABLE IF NOT EXISTS tally_results (
    election_id UUID PRIMARY KEY REFERENCES elections(election_id) ON DELETE CASCADE,
    encrypted_result TEXT,
    proof TEXT,
    published_at TIMESTAMPTZ
);

-- 11. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_role VARCHAR(50),
    action TEXT,
    entity VARCHAR(50),
    entity_id UUID,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    hash TEXT,
    previous_hash TEXT
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_elections_created_at ON elections(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_elections_is_published ON elections(is_published);
CREATE INDEX IF NOT EXISTS idx_elections_dates ON elections(start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_ballots_election_id ON ballots(election_id);
CREATE INDEX IF NOT EXISTS idx_ballots_published ON ballots(election_id, is_published);
CREATE INDEX IF NOT EXISTS idx_candidates_ballot_id ON candidates(ballot_id);
CREATE INDEX IF NOT EXISTS idx_votes_election_id ON votes(election_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity, entity_id);

-- Insert default roles
INSERT INTO roles (role_name) VALUES ('ADMIN'), ('VOTER'), ('OBSERVER')
ON CONFLICT (role_name) DO NOTHING;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Schema created successfully!';
END $$;
