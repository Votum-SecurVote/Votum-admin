# Votum — Secure Voting Admin

A full-stack admin panel for managing elections, ballots, and candidates in a secure voting system.

**Frontend (React) ↔ Backend (Spring Boot) ↔ Database (PostgreSQL)**

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Running the App](#running-the-app)

---

## Quick Start

```bash
# Clone the repository
git clone https://github.com/SanjaiPG/Secure-Voting-System.git
cd Secure-Voting-System/vote-admin

# Install frontend dependencies
cd frontend
npm install
npm run dev
```

---

## Prerequisites

### Java 17 *(Required for Spring Boot Backend)*
```bash
java -version   # Should show 17.x.x
```
Download: https://adoptium.net/

### Maven *(Required for Spring Boot Backend)*
```bash
mvn --version   # Should show Apache Maven 3.x.x
```
Download: https://maven.apache.org/download.cgi

### Node.js & npm *(Required for Frontend)*
```bash
node --version  # Should be v18+
npm --version   # Should be v9+
```
Download: https://nodejs.org/

### PostgreSQL *(Required for Database)*
```bash
psql --version
```
Download: https://www.postgresql.org/download/

### Git
```bash
git --version
```

---

## Installation

### Step 1: Clone the Repository
```bash
git clone https://github.com/SanjaiPG/Secure-Voting-System.git
cd Secure-Voting-System/vote-admin
```

### Step 2: Set Up PostgreSQL Database
```bash
# Connect to PostgreSQL
psql -U postgres

# Create the database
CREATE DATABASE vote_admin;
\q

# Run the schema
psql -U postgres -d vote_admin -f schema.sql
```

Update database credentials in `backend-spring/src/main/resources/application.yml`:
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/vote_admin
    username: postgres
    password: your_password_here
```

### Step 3: Install Dependencies

**Frontend:**
```bash
cd frontend
npm install
cd ..
```

**Node.js Backend (optional):**
```bash
cd backend
npm install
cd ..
```

**Spring Boot:** Maven auto-downloads dependencies on first run — no manual step needed.

---

## Running the App

### Option A: VS Code Tasks *(Recommended)*
1. Press `Cmd+Shift+P` → `Tasks: Run Task`
2. Select `Start All Services`

Or run individually:
- `Start Spring Boot Backend`
- `Start Frontend`

### Option B: Terminal

**Terminal 1 — Spring Boot Backend:**
```bash
cd backend-spring
mvn spring-boot:run
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

