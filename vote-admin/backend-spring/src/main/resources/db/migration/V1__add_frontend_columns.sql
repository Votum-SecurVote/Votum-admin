-- Add columns required for frontend compatibility (run if your ERD tables already exist).
-- Run once. If a column already exists, that statement will error; run the rest manually or ignore.

-- elections: add is_published, created_at, voting_rules if missing
ALTER TABLE elections ADD COLUMN is_published BOOLEAN DEFAULT FALSE;
ALTER TABLE elections ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE elections ADD COLUMN voting_rules TEXT;

-- ballots: add title, description, max_selections if missing
ALTER TABLE ballots ADD COLUMN title TEXT;
ALTER TABLE ballots ADD COLUMN description TEXT;
ALTER TABLE ballots ADD COLUMN max_selections INTEGER DEFAULT 1;

-- candidates: add party if missing
ALTER TABLE candidates ADD COLUMN party VARCHAR(255);
