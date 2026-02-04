# Secure Voting System - Vote Admin

Admin interface for managing secure voting elections.

## Quick Start

**For detailed setup instructions, see [SETUP.md](./SETUP.md)**

## Prerequisites Checklist

Your friend needs to install:

1. ✅ **Java 17** - For Spring Boot backend
2. ✅ **Maven** - For building/running Spring Boot
3. ✅ **Node.js & npm** - For frontend and Node.js backend
4. ✅ **PostgreSQL** - Database
5. ✅ **Git** - To clone the repository

## Quick Installation Commands

### Verify Prerequisites
```bash
java -version    # Should show Java 17
mvn --version    # Should show Maven 3.x
node --version   # Should show Node 18+
npm --version    # Should show npm 9+
psql --version   # Should show PostgreSQL
```

### Setup Steps
```bash
# 1. Clone repository
git clone https://github.com/SanjaiPG/Secure-Voting-System.git
cd Secure-Voting-System/vote-admin

# 2. Create database
psql -U postgres -c "CREATE DATABASE vote_admin;"
psql -U postgres -d vote_admin -f schema.sql

# 3. Install dependencies
cd frontend && npm install && cd ..
cd backend && npm install && cd ..

# 4. Update database password in:
# backend-spring/src/main/resources/application.yml

# 5. Run services
# Terminal 1:
cd backend-spring && mvn spring-boot:run

# Terminal 2:
cd frontend && npm run dev
```

## Running in VS Code

1. Open project in VS Code
2. Press `Ctrl+Shift+P` → `Tasks: Run Task`
3. Select `Start All Services`

Or use the Debug panel (`F5`) and select `Launch All Services`

## Access

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **Login**: Username: `admin`, Password: `admin123`

## Project Structure

```
vote-admin/
├── frontend/          # React frontend (Vite)
├── backend/           # Node.js backend (optional)
├── backend-spring/    # Spring Boot backend (main)
├── schema.sql         # Database schema
└── .vscode/           # VS Code configurations
```

## Need Help?

See [SETUP.md](./SETUP.md) for detailed instructions and troubleshooting.
