# Secure Voting System - Architecture Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Frontend Architecture](#frontend-architecture)
3. [Backend Architecture](#backend-architecture)
4. [Frontend-Backend Mapping](#frontend-backend-mapping)
5. [Data Flow](#data-flow)
6. [Authentication Flow](#authentication-flow)
7. [Component Details](#component-details)

---

## System Overview

The Secure Voting System is a full-stack web application for managing elections and ballots. It follows a **React Frontend + Spring Boot Backend** architecture with PostgreSQL database.

### Technology Stack
- **Frontend**: React 19, Vite, React Router, Axios, Framer Motion, Styled Components
- **Backend**: Spring Boot 3.2.5, Java 17, Spring Data JPA
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)

---

## Frontend Architecture

### 1. **Application Structure**

```
frontend/
├── src/
│   ├── App.jsx              # Main router and route definitions
│   ├── main.jsx             # Application entry point
│   ├── components/          # Reusable UI components
│   │   ├── Navbar.jsx       # Navigation bar with auth controls
│   │   ├── AnimatedCard.jsx # Card component with animations
│   │   ├── Loader.jsx       # Loading spinner
│   │   └── PageTransition.jsx # Page transition animations
│   ├── pages/admin/         # Admin pages
│   │   ├── Login.jsx        # Authentication page
│   │   ├── ElectionCreate.jsx # Create new elections
│   │   ├── ElectionView.jsx  # View/manage elections
│   │   └── BallotDesigner.jsx # Design ballots with candidates
│   ├── routes/
│   │   └── AdminRoute.jsx   # Protected route wrapper
│   ├── services/            # API service layer
│   │   ├── authService.js   # Authentication API calls
│   │   └── electionService.js # Election/Ballot API calls
│   ├── context/
│   │   └── AuthContext.jsx  # Global authentication state
│   └── styles/
│       └── adminTheme.css   # Global CSS variables
```

### 2. **Key Frontend Components**

#### **App.jsx** - Main Router
- Defines all application routes
- Public routes: `/login`, `/elections/public`
- Protected routes: `/admin/*` (wrapped in `AdminRoute`)
- Uses React Router for navigation
- Implements page transitions with Framer Motion

#### **Login.jsx** - Authentication
- **Purpose**: Admin login interface
- **Features**:
  - Username/password form
  - Error handling and display
  - Loading states
  - Redirects to admin dashboard on success
- **API Call**: `POST /api/auth/login`
- **State Management**: Uses `AuthContext` to store JWT token

#### **ElectionCreate.jsx** - Create Elections
- **Purpose**: Form to create new elections
- **Features**:
  - Title, description, start/end dates
  - Voting rules input
  - IST to UTC timezone conversion
  - Success message with redirect to ballot designer
- **API Call**: `POST /api/elections`
- **Data Flow**: Form → API → Save election ID → Redirect to ballot designer

#### **ElectionView.jsx** - Manage Elections
- **Purpose**: Dashboard to view and manage all elections
- **Features**:
  - List all elections with status badges (draft/published/active/ended)
  - Real-time progress bars
  - Publish/Unpublish/Delete actions
  - Ballot version history display
  - Ballot publish/unpublish/rollback
  - Statistics (total, active, draft counts)
- **API Calls**:
  - `GET /api/elections/admin` - Load all elections
  - `GET /api/elections/{id}/ballots` - Load ballots for election
  - `POST /api/elections/{id}/publish` - Publish election
  - `POST /api/elections/{id}/unpublish` - Unpublish election
  - `DELETE /api/elections/{id}` - Delete election
  - `POST /api/ballots/{id}/publish` - Publish ballot version
  - `POST /api/ballots/{id}/unpublish` - Unpublish ballot
  - `POST /api/ballots/{id}/rollback` - Rollback to previous version

#### **BallotDesigner.jsx** - Design Ballots
- **Purpose**: Create and manage ballot versions with candidates
- **Features**:
  - Select election from dropdown
  - Add/remove/reorder candidates (drag & drop)
  - Candidate fields: name, party, description
  - Version management (shows existing versions)
  - Save as new version
  - Prevents editing when election is published
- **API Calls**:
  - `GET /api/elections/admin` - Load elections list
  - `GET /api/elections/{id}/ballots` - Load existing ballot versions
  - `POST /api/elections/{id}/ballots` - Create new ballot version
  - `POST /api/elections/{id}/publish` - Publish election

#### **Navbar.jsx** - Navigation
- **Purpose**: Top navigation bar
- **Features**:
  - Logo/branding
  - Admin links (Create, Ballot, View) - only visible to admins
  - Login/Logout button
  - Active route highlighting
- **Auth Integration**: Checks `AuthContext` for user role

#### **AdminRoute.jsx** - Route Protection
- **Purpose**: Protects admin routes from unauthorized access
- **Logic**:
  1. Checks `localStorage` for auth token
  2. Validates token and role === 'ADMIN'
  3. Redirects to `/login` if not authenticated
  4. Renders child routes if authenticated

### 3. **Service Layer**

#### **authService.js**
```javascript
loginAdmin(username, password)
  → POST /api/auth/login
  → Stores token in localStorage
  → Returns { token, role }
```

#### **electionService.js**
- **Election Operations**:
  - `createElection(data)` → `POST /api/elections`
  - `getElection(id)` → `GET /api/elections/{id}`
  - `getActiveElections()` → `GET /api/elections/active`
  - `getAdminElections()` → `GET /api/elections/admin`
  - `publishElection(id)` → `POST /api/elections/{id}/publish`
  - `unpublishElection(id)` → `POST /api/elections/{id}/unpublish`
  - `deleteElection(id)` → `DELETE /api/elections/{id}`

- **Ballot Operations**:
  - `createBallot(electionId, data)` → `POST /api/elections/{id}/ballots`
  - `getElectionBallots(electionId)` → `GET /api/elections/{id}/ballots`
  - `publishBallot(ballotId)` → `POST /api/ballots/{id}/publish`
  - `unpublishBallot(ballotId)` → `POST /api/ballots/{id}/unpublish`
  - `rollbackBallot(ballotId, targetVersion)` → `POST /api/ballots/{id}/rollback`

- **Axios Interceptors**:
  - **Request**: Automatically adds `Authorization: Bearer {token}` header
  - **Response**: Handles errors and extracts error messages

### 4. **State Management**

#### **AuthContext.jsx** - Global Auth State
- **State**: `{ user: { token, role }, loading }`
- **Methods**:
  - `login(auth)` - Sets user and saves to localStorage
  - `logout()` - Clears user and localStorage
- **Usage**: Wraps entire app, accessible via `useAuth()` hook

---

## Backend Architecture

### 1. **Spring Boot Structure**

```
backend-spring/
├── src/main/java/com/voteadmin/
│   ├── VoteAdminApplication.java  # Main Spring Boot app
│   ├── controller/                 # REST Controllers
│   │   ├── AuthController.java    # Authentication endpoints
│   │   ├── ElectionController.java # Election CRUD operations
│   │   └── BallotController.java   # Ballot version management
│   ├── service/                    # Business logic layer
│   │   ├── AuthService.java       # JWT token generation
│   │   ├── ElectionService.java   # Election business logic
│   │   └── BallotService.java     # Ballot business logic
│   ├── repository/                # Data access layer (JPA)
│   │   ├── ElectionRepository.java
│   │   ├── BallotRepository.java
│   │   └── CandidateRepository.java
│   ├── entity/                    # JPA entities (database tables)
│   │   ├── Election.java
│   │   ├── Ballot.java
│   │   ├── Candidate.java
│   │   └── ...
│   ├── dto/                       # Data Transfer Objects
│   │   ├── ElectionRequest.java
│   │   ├── ElectionResponse.java
│   │   ├── BallotRequest.java
│   │   └── BallotResponse.java
│   └── config/
│       └── CorsConfig.java        # CORS configuration
└── src/main/resources/
    └── application.yml            # Database & app configuration
```

### 2. **Backend Controllers**

#### **AuthController.java**
```java
@RestController
@RequestMapping("/api/auth")
POST /api/auth/login
  → Validates username/password (hardcoded: admin/admin123)
  → Generates JWT token via AuthService
  → Returns { success: true, token: "...", role: "ADMIN" }
```

#### **ElectionController.java**
```java
@RestController
@RequestMapping("/api/elections")

POST /api/elections
  → Creates new election
  → Maps ElectionRequest → Election entity
  → Saves to database via ElectionService
  → Returns ElectionResponse

GET /api/elections/admin
  → Returns all elections (for admin dashboard)
  → Includes candidates and ballot info

GET /api/elections/active
  → Returns only published and active elections
  → Public endpoint (no auth required)

GET /api/elections/{id}
  → Returns single election by ID
  → Includes full details

POST /api/elections/{id}/publish
  → Sets election.isPublished = true
  → Updates status to "published"
  → Logs audit trail

POST /api/elections/{id}/unpublish
  → Sets election.isPublished = false
  → Updates status to "draft"

DELETE /api/elections/{id}
  → Deletes election and cascades to ballots/candidates
```

#### **BallotController.java**
```java
@RestController
@RequestMapping("/api")

POST /api/elections/{electionId}/ballots
  → Creates new ballot version
  → Validates election exists
  → Calculates next version number
  → Saves ballot with candidates
  → Returns BallotResponse

GET /api/elections/{electionId}/ballots
  → Returns all ballot versions for election
  → Ordered by version number

POST /api/ballots/{ballotId}/publish
  → Sets ballot.isPublished = true
  → Unpublishes other versions of same election

POST /api/ballots/{ballotId}/unpublish
  → Sets ballot.isPublished = false

POST /api/ballots/{ballotId}/rollback
  → Creates new ballot version from previous version
  → Copies candidates from target version
```

### 3. **Service Layer**

#### **ElectionService.java**
- **Responsibilities**:
  - Business logic for election operations
  - Status calculation (draft/published/active/ended)
  - Validation rules
  - Audit logging

#### **BallotService.java**
- **Responsibilities**:
  - Version management (incrementing version numbers)
  - Publishing logic (ensures only one published version)
  - Rollback functionality
  - Candidate management

#### **AuthService.java**
- **Responsibilities**:
  - JWT token generation
  - Token signing with secret key
  - Role encoding in token claims

### 4. **Database Layer**

#### **JPA Entities**
- **Election**: Stores election metadata (title, dates, status, voting rules)
- **Ballot**: Stores ballot versions (version number, isPublished, title, description)
- **Candidate**: Stores candidate info (name, party, description) linked to ballot
- **AuditLog**: Stores all admin actions for audit trail

#### **Repositories**
- Spring Data JPA repositories provide CRUD operations
- Custom queries for filtering (e.g., find published elections)

---

## Frontend-Backend Mapping

### Complete API Endpoint Mapping

| Frontend Component | Frontend Call | Backend Endpoint | Backend Controller | Purpose |
|-------------------|---------------|------------------|-------------------|---------|
| **Login.jsx** | `loginAdmin()` | `POST /api/auth/login` | `AuthController.login()` | Authenticate admin |
| **ElectionCreate.jsx** | `createElection()` | `POST /api/elections` | `ElectionController.create()` | Create new election |
| **ElectionView.jsx** | `getAdminElections()` | `GET /api/elections/admin` | `ElectionController.getAdminElections()` | Load all elections |
| **ElectionView.jsx** | `getElectionBallots()` | `GET /api/elections/{id}/ballots` | `BallotController.getBallots()` | Load ballot versions |
| **ElectionView.jsx** | `publishElection()` | `POST /api/elections/{id}/publish` | `ElectionController.publish()` | Publish election |
| **ElectionView.jsx** | `unpublishElection()` | `POST /api/elections/{id}/unpublish` | `ElectionController.unpublish()` | Unpublish election |
| **ElectionView.jsx** | `deleteElection()` | `DELETE /api/elections/{id}` | `ElectionController.delete()` | Delete election |
| **ElectionView.jsx** | `publishBallot()` | `POST /api/ballots/{id}/publish` | `BallotController.publishBallot()` | Publish ballot version |
| **ElectionView.jsx** | `unpublishBallot()` | `POST /api/ballots/{id}/unpublish` | `BallotController.unpublishBallot()` | Unpublish ballot |
| **ElectionView.jsx** | `rollbackBallot()` | `POST /api/ballots/{id}/rollback` | `BallotController.rollback()` | Rollback to previous version |
| **BallotDesigner.jsx** | `getAdminElections()` | `GET /api/elections/admin` | `ElectionController.getAdminElections()` | Load elections dropdown |
| **BallotDesigner.jsx** | `getElectionBallots()` | `GET /api/elections/{id}/ballots` | `BallotController.getBallots()` | Load existing versions |
| **BallotDesigner.jsx** | `createBallot()` | `POST /api/elections/{id}/ballots` | `BallotController.createBallot()` | Create new ballot version |
| **BallotDesigner.jsx** | `publishElection()` | `POST /api/elections/{id}/publish` | `ElectionController.publish()` | Publish election |

---

## Data Flow

### 1. **Election Creation Flow**

```
User fills form (ElectionCreate.jsx)
  ↓
Submit → electionService.createElection(payload)
  ↓
POST /api/elections (with JWT token in header)
  ↓
ElectionController.create() receives request
  ↓
ElectionService.create() validates & processes
  ↓
ElectionRepository.save() → PostgreSQL
  ↓
ElectionResponse returned
  ↓
Frontend receives response → Shows success → Redirects to BallotDesigner
```

### 2. **Ballot Creation Flow**

```
User selects election (BallotDesigner.jsx)
  ↓
User adds candidates (name, party, description)
  ↓
User clicks "Save as new version"
  ↓
electionService.createBallot(electionId, { options: candidates })
  ↓
POST /api/elections/{id}/ballots
  ↓
BallotController.createBallot()
  ↓
BallotService calculates next version number
  ↓
Saves Ballot entity + Candidate entities (linked)
  ↓
Returns BallotResponse with version number
  ↓
Frontend updates UI → Shows success message
```

### 3. **Election Publishing Flow**

```
Admin clicks "Publish Election" (ElectionView.jsx)
  ↓
electionService.publishElection(electionId)
  ↓
POST /api/elections/{id}/publish
  ↓
ElectionController.publish()
  ↓
ElectionService sets isPublished = true, status = "published"
  ↓
AuditService logs action
  ↓
Database updated
  ↓
Frontend refreshes election list → Shows "published" badge
```

### 4. **Ballot Version Management Flow**

```
Admin views ballot history (ElectionView.jsx)
  ↓
GET /api/elections/{id}/ballots
  ↓
Returns array of ballot versions: [{ version: 1, isPublished: false }, { version: 2, isPublished: true }]
  ↓
Frontend displays versions with publish/unpublish/rollback buttons
  ↓
Admin clicks "Rollback to Version 1"
  ↓
POST /api/ballots/{id}/rollback { targetVersion: 1 }
  ↓
BallotService creates new version (v3) copying candidates from v1
  ↓
Returns new ballot version
  ↓
Frontend refreshes → Shows v3 in list
```

---

## Authentication Flow

### 1. **Login Process**

```
User enters credentials (Login.jsx)
  ↓
loginAdmin(username, password)
  ↓
POST /api/auth/login { username, password }
  ↓
AuthController validates credentials
  ↓
AuthService.generateToken(userId, role)
  ↓
Returns { token: "JWT...", role: "ADMIN" }
  ↓
Frontend stores in localStorage: { token, role }
  ↓
AuthContext.login() updates global state
  ↓
Redirect to /admin/election/view
```

### 2. **Protected Route Access**

```
User navigates to /admin/election/create
  ↓
AdminRoute checks localStorage for auth
  ↓
If token exists and role === 'ADMIN' → Allow access
  ↓
If no token or wrong role → Redirect to /login
```

### 3. **API Request Authentication**

```
Frontend makes API call (e.g., createElection)
  ↓
Axios interceptor checks localStorage
  ↓
Adds header: Authorization: Bearer {token}
  ↓
Backend receives request
  ↓
(Currently: Extracts "admin" from token, but could validate JWT)
  ↓
Processes request
```

---

## Component Details

### Frontend Component Responsibilities

| Component | Primary Responsibility | Key Features |
|-----------|----------------------|--------------|
| **App.jsx** | Route definition & navigation | Public/private routes, page transitions |
| **Login.jsx** | User authentication | Form validation, error handling, token storage |
| **ElectionCreate.jsx** | Election creation | Form handling, timezone conversion, redirect |
| **ElectionView.jsx** | Election management dashboard | List view, detail view, actions (publish/delete), ballot history |
| **BallotDesigner.jsx** | Ballot version creation | Candidate management, version tracking, drag & drop |
| **Navbar.jsx** | Navigation & auth UI | Route links, login/logout, role-based visibility |
| **AdminRoute.jsx** | Route protection | Auth validation, redirect logic |
| **AuthContext.jsx** | Global auth state | Token management, login/logout methods |

### Backend Component Responsibilities

| Component | Primary Responsibility | Key Features |
|-----------|----------------------|--------------|
| **AuthController** | Authentication endpoints | Login validation, JWT generation |
| **ElectionController** | Election CRUD operations | Create, read, update, delete, publish/unpublish |
| **BallotController** | Ballot version management | Create versions, publish/unpublish, rollback |
| **ElectionService** | Election business logic | Status calculation, validation, audit logging |
| **BallotService** | Ballot business logic | Version management, publishing rules |
| **AuthService** | JWT token management | Token generation, signing |
| **Repositories** | Database access | CRUD operations via JPA |

---

## Key Design Patterns

### 1. **RESTful API Design**
- Standard HTTP methods (GET, POST, DELETE)
- Resource-based URLs (`/api/elections/{id}`)
- Consistent response format: `{ success: boolean, data: {...} }`

### 2. **Separation of Concerns**
- **Frontend**: UI/UX, user interaction, client-side validation
- **Backend**: Business logic, data validation, database operations
- **Service Layer**: Encapsulates business rules

### 3. **State Management**
- **Local State**: Component-specific (forms, UI state)
- **Global State**: AuthContext for authentication
- **Server State**: Fetched via API calls, stored in component state

### 4. **Error Handling**
- Frontend: Try-catch blocks, error messages in UI
- Backend: Exception handling, HTTP status codes
- Axios interceptors for consistent error handling

### 5. **Security**
- JWT tokens for authentication
- Protected routes (AdminRoute)
- CORS configuration for cross-origin requests
- Authorization headers on API requests

---

## Database Schema Overview

### Key Tables
- **elections**: Election metadata (title, dates, status, voting rules)
- **ballots**: Ballot versions (version number, isPublished, linked to election)
- **candidates**: Candidate information (name, party, description, linked to ballot)
- **audit_logs**: Action history for compliance

### Relationships
- One Election → Many Ballots (one-to-many)
- One Ballot → Many Candidates (one-to-many)
- Ballots have version numbers (1, 2, 3...) per election

---

## Summary

This architecture demonstrates:
1. **Modern Frontend**: React with hooks, context API, and modern UI libraries
2. **RESTful Backend**: Spring Boot with clean separation of concerns
3. **Database Integration**: PostgreSQL with JPA/Hibernate ORM
4. **Authentication**: JWT-based stateless authentication
5. **Version Management**: Ballot versioning system for audit trail
6. **Real-time Updates**: Progress bars, status badges, live data refresh

The system is designed for scalability, maintainability, and security, following industry best practices for full-stack web applications.
