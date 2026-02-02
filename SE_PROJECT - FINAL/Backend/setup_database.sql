-- Database Setup Script
-- Run as postgres superuser

-- 1. Create application user
DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE rolname = 'evoting_app'
   ) THEN
      CREATE ROLE evoting_app WITH LOGIN PASSWORD 'securePass123!';
   END IF;
END
$do$;

-- 2. Create database if not exists
SELECT 'CREATE DATABASE evoting'
WHERE NOT EXISTS (
   SELECT FROM pg_database WHERE datname = 'evoting'
)\gexec

-- 3. Ownership & privileges
ALTER DATABASE evoting OWNER TO evoting_app;
GRANT CONNECT ON DATABASE evoting TO evoting_app;

\c evoting

GRANT USAGE, CREATE ON SCHEMA public TO evoting_app;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO evoting_app;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT USAGE, SELECT ON SEQUENCES TO evoting_app;
