# Vote Admin - Spring Boot Backend

Backend for the vote-admin React frontend. Uses PostgreSQL (local or AWS RDS).

## Prerequisites

- Java 17+
- Maven 3.6+
- PostgreSQL (local or RDS)

## 1. Database setup

### Option A: Your ERD tables already exist

Run the migration to add frontend-needed columns:

```bash
psql -d your_database -f src/main/resources/db/migration/V1__add_frontend_columns.sql
```

### Option B: Fresh database

Create the database and run your ERD schema (create `users`, `roles`, `user_roles`, `identity_verification`, `elections`, `ballots`, `candidates`, `votes`, `vote_receipts`, `tally_results`, `audit_logs`). Then run the migration above to add extra columns.

## 2. Configuration

### Local PostgreSQL

Create `src/main/resources/application-local.yml` or set env vars:

```bash
export PGHOST=localhost
export PGPORT=5432
export PGDATABASE=vote_admin
export PGUSER=postgres
export PGPASSWORD=yourpassword
```

Or use a single URL:

```bash
export DATABASE_URL=jdbc:postgresql://localhost:5432/vote_admin
export PGUSER=postgres
export PGPASSWORD=yourpassword
```

### AWS RDS

```bash
export DATABASE_URL=jdbc:postgresql://your-rds-endpoint:5432/your_db
export PGUSER=your_user
export PGPASSWORD=your_password
```

Optional: `export spring.profiles.active=rds`

### JWT

```bash
export JWT_SECRET=your_secret_key
```

Default for dev: `dev_jwt_secret_123`.

### Port

```bash
export PORT=5000
```

Default: 5000 (same as frontend expectation).

## 3. Run

```bash
mvn spring-boot:run
```

Or:

```bash
mvn clean package
java -jar target/vote-admin-backend-1.0.0.jar
```

Backend will be at `http://localhost:5000`. API base: `http://localhost:5000/api`.

## 4. CORS

CORS is configured so the React app (e.g. `http://localhost:5173`) can call the API. Allowed origins: localhost:5173, localhost:3000.

## 5. API paths (match frontend)

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/auth/login | Admin login → { token, role } |
| POST | /api/elections | Create election |
| GET | /api/elections/admin | All elections (admin) |
| GET | /api/elections/active | Active elections (public) |
| GET | /api/elections/:id | One election (public, published only) |
| POST | /api/elections/:id/publish | Publish |
| POST | /api/elections/:id/unpublish | Unpublish |
| DELETE | /api/elections/:id | Delete |
| POST | /api/elections/:electionId/ballots | Create ballot |
| GET | /api/elections/:electionId/ballots | List ballots |
| POST | /api/ballots/:ballotId/publish | Publish ballot |
| POST | /api/ballots/:ballotId/unpublish | Unpublish ballot |
| POST | /api/ballots/:ballotId/rollback | Body: { targetVersion } |

## 6. Entity ↔ ERD mapping

| ERD table | Entity | PK |
|-----------|--------|-----|
| users | User | user_id (UUID) |
| roles | Role | role_id (int) |
| user_roles | UserRole | (user_id, role_id) |
| identity_verification | IdentityVerification | verification_id (UUID) |
| elections | Election | election_id (UUID) |
| ballots | Ballot | ballot_id (UUID) |
| candidates | Candidate | candidate_id (UUID) |
| votes | Vote | vote_id (UUID) |
| vote_receipts | VoteReceipt | receipt_hash (varchar) |
| tally_results | TallyResult | election_id (UUID) |
| audit_logs | AuditLog | log_id (UUID) |

Extra columns added by migration: `elections` (is_published, created_at, voting_rules), `ballots` (title, description, max_selections), `candidates` (party).
