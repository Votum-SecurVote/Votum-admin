# Setup Guide - Secure Voting System

This guide will help you set up and run the Secure Voting System on your machine.

## Prerequisites

Before you begin, make sure you have the following installed:

### 1. **Java 17** (Required for Spring Boot Backend)
   - Download: https://adoptium.net/ or https://www.oracle.com/java/technologies/downloads/#java17
   - Verify installation:
     ```bash
     java -version
     ```
     Should show version 17.x.x

### 2. **Maven** (Required for Spring Boot Backend)
   - Download: https://maven.apache.org/download.cgi
   - Installation guide: https://maven.apache.org/install.html
   - Verify installation:
     ```bash
     mvn --version
     ```
     Should show Apache Maven 3.x.x

### 3. **Node.js and npm** (Required for Frontend and Node.js Backend)
   - Download: https://nodejs.org/ (LTS version recommended)
   - This installs both Node.js and npm
   - Verify installation:
     ```bash
     node --version
     npm --version
     ```
     Node.js should be v18.x.x or higher
     npm should be v9.x.x or higher

### 4. **PostgreSQL** (Required for Database)
   - Download: https://www.postgresql.org/download/
   - Installation guides:
     - **Linux**: https://www.postgresql.org/download/linux/
     - **Windows**: https://www.postgresql.org/download/windows/
     - **macOS**: https://www.postgresql.org/download/macos/
   - Verify installation:
     ```bash
     psql --version
     ```
   - Make sure PostgreSQL service is running:
     ```bash
     # Linux
     sudo systemctl status postgresql
     
     # macOS
     brew services list | grep postgresql
     
     # Windows
     # Check Services panel in Windows
     ```

### 5. **Git** (Required to clone the repository)
   - Usually pre-installed on Linux/macOS
   - Windows: https://git-scm.com/download/win
   - Verify installation:
     ```bash
     git --version
     ```

## Installation Steps

### Step 1: Clone the Repository

```bash
git clone https://github.com/SanjaiPG/Secure-Voting-System.git
cd Secure-Voting-System/vote-admin
```

### Step 2: Set Up PostgreSQL Database

1. **Create the database:**
   ```bash
   # Connect to PostgreSQL
   psql -U postgres
   
   # Create database
   CREATE DATABASE vote_admin;
   
   # Exit psql
   \q
   ```

2. **Run the schema:**
   ```bash
   psql -U postgres -d vote_admin -f schema.sql
   ```
   
   Or if you need to enter password:
   ```bash
   PGPASSWORD=your_password psql -U postgres -d vote_admin -f schema.sql
   ```

3. **Update database credentials** in `backend-spring/src/main/resources/application.yml`:
   ```yaml
   spring:
     datasource:
       url: jdbc:postgresql://localhost:5432/vote_admin
       username: postgres
       password: your_password_here
   ```

### Step 3: Install Dependencies

#### Install Frontend Dependencies
```bash
cd frontend
npm install
cd ..
```

#### Install Node.js Backend Dependencies (Optional - if using Node.js backend)
```bash
cd backend
npm install
cd ..
```

#### Spring Boot Backend
Maven will automatically download dependencies when you run it. No manual installation needed.

### Step 4: Run the Application

You have two options:

#### Option A: Using VS Code (Recommended)

1. Open the project in VS Code
2. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
3. Type: `Tasks: Run Task`
4. Select: `Start All Services`

Or use individual tasks:
- `Start Spring Boot Backend`
- `Start Frontend`

#### Option B: Using Terminal

**Terminal 1 - Spring Boot Backend:**
```bash
cd backend-spring
mvn spring-boot:run
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Step 5: Access the Application

- **Frontend**: http://localhost:5173 (or http://localhost:5174 if 5173 is in use)
- **Backend API**: http://localhost:5000/api

## Default Login Credentials

- **Username**: `admin`
- **Password**: `admin123`

## Troubleshooting

### Port 5000 Already in Use
If you get `EADDRINUSE: address already in use :::5000`:
- Stop the process using port 5000:
  ```bash
  # Find the process
  lsof -i :5000
  # Kill it (replace PID with actual process ID)
  kill PID
  ```

### PostgreSQL Connection Error
- Make sure PostgreSQL is running
- Check your credentials in `application.yml`
- Verify database exists: `psql -U postgres -l | grep vote_admin`

### Maven Not Found
- Make sure Maven is installed and in your PATH
- Add Maven to PATH if needed (see Maven installation guide)

### Node.js Version Issues
- Make sure you have Node.js 18+ installed
- Use `nvm` (Node Version Manager) if you need to switch versions

## Quick Verification Checklist

- [ ] Java 17 installed (`java -version`)
- [ ] Maven installed (`mvn --version`)
- [ ] Node.js installed (`node --version`)
- [ ] PostgreSQL installed and running (`psql --version`)
- [ ] Database `vote_admin` created
- [ ] Schema.sql executed
- [ ] Dependencies installed (`npm install` in frontend and backend)
- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173/5174

## Need Help?

If you encounter any issues:
1. Check the error messages in the terminal
2. Verify all prerequisites are installed
3. Make sure PostgreSQL is running
4. Check that ports 5000 and 5173 are not in use by other applications
