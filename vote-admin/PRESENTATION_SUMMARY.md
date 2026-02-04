# Presentation Summary - How the System Works

## Quick Overview

### System Architecture
**Frontend (React) ↔ Backend (Spring Boot) ↔ Database (PostgreSQL)**

---

## 1. FRONTEND COMPONENTS & THEIR PURPOSE

### **Login Page** (`Login.jsx`)
- **What it does**: Admin authentication interface
- **How it works**: 
  - User enters username/password
  - Sends credentials to backend: `POST /api/auth/login`
  - Backend validates and returns JWT token
  - Token stored in browser localStorage
  - User redirected to admin dashboard

### **Election Create Page** (`ElectionCreate.jsx`)
- **What it does**: Form to create new elections
- **How it works**:
  - Admin fills form: title, description, start/end dates, voting rules
  - Converts IST timezone to UTC for backend
  - Sends data: `POST /api/elections`
  - Backend saves to PostgreSQL `elections` table
  - On success, redirects to Ballot Designer

### **Election View Page** (`ElectionView.jsx`)
- **What it does**: Dashboard to manage all elections
- **How it works**:
  - Loads all elections: `GET /api/elections/admin`
  - Displays list with status badges (draft/published/active/ended)
  - Shows real-time progress bars for active elections
  - **Actions available**:
    - **Publish**: `POST /api/elections/{id}/publish` → Sets `isPublished = true`
    - **Unpublish**: `POST /api/elections/{id}/unpublish` → Sets `isPublished = false`
    - **Delete**: `DELETE /api/elections/{id}` → Removes from database
  - **Ballot Management**:
    - Loads ballot versions: `GET /api/elections/{id}/ballots`
    - Shows version history (v1, v2, v3...)
    - Can publish/unpublish specific ballot versions
    - **Rollback**: Creates new version from previous one

### **Ballot Designer Page** (`BallotDesigner.jsx`)
- **What it does**: Create ballot versions with candidates
- **How it works**:
  - Admin selects election from dropdown
  - Adds candidates: name, party, description
  - Can drag & drop to reorder candidates
  - **Saves as new version**: `POST /api/elections/{id}/ballots`
  - Backend calculates next version number automatically
  - Each version stored separately in `ballots` table
  - Candidates linked to ballot in `candidates` table

---

## 2. BACKEND COMPONENTS & THEIR PURPOSE

### **AuthController** (`/api/auth`)
- **Endpoint**: `POST /api/auth/login`
- **What it does**: Validates credentials, generates JWT token
- **Returns**: `{ token: "JWT...", role: "ADMIN" }`

### **ElectionController** (`/api/elections`)
- **Endpoints**:
  - `POST /api/elections` → Create election
  - `GET /api/elections/admin` → Get all elections (admin view)
  - `GET /api/elections/active` → Get active elections (public)
  - `GET /api/elections/{id}` → Get single election
  - `POST /api/elections/{id}/publish` → Publish election
  - `POST /api/elections/{id}/unpublish` → Unpublish election
  - `DELETE /api/elections/{id}` → Delete election

### **BallotController** (`/api`)
- **Endpoints**:
  - `POST /api/elections/{id}/ballots` → Create ballot version
  - `GET /api/elections/{id}/ballots` → Get all ballot versions
  - `POST /api/ballots/{id}/publish` → Publish ballot version
  - `POST /api/ballots/{id}/unpublish` → Unpublish ballot
  - `POST /api/ballots/{id}/rollback` → Rollback to previous version

---

## 3. HOW FRONTEND MAPS TO BACKEND

### Complete Mapping Table

| **Frontend Action** | **Frontend Code** | **API Call** | **Backend Controller** | **What Happens** |
|---------------------|-------------------|--------------|------------------------|------------------|
| User logs in | `Login.jsx` → `loginAdmin()` | `POST /api/auth/login` | `AuthController.login()` | Validates credentials, returns JWT token |
| Create election | `ElectionCreate.jsx` → `createElection()` | `POST /api/elections` | `ElectionController.create()` | Saves election to database |
| View all elections | `ElectionView.jsx` → `getAdminElections()` | `GET /api/elections/admin` | `ElectionController.getAdminElections()` | Returns all elections with status |
| View ballot versions | `ElectionView.jsx` → `getElectionBallots()` | `GET /api/elections/{id}/ballots` | `BallotController.getBallots()` | Returns all ballot versions for election |
| Publish election | `ElectionView.jsx` → `publishElection()` | `POST /api/elections/{id}/publish` | `ElectionController.publish()` | Sets `isPublished = true` in database |
| Create ballot | `BallotDesigner.jsx` → `createBallot()` | `POST /api/elections/{id}/ballots` | `BallotController.createBallot()` | Creates new ballot version with candidates |
| Rollback ballot | `ElectionView.jsx` → `rollbackBallot()` | `POST /api/ballots/{id}/rollback` | `BallotController.rollback()` | Creates new version copying from previous |

---

## 4. DATA FLOW EXAMPLE: Creating an Election

```
1. User fills form in ElectionCreate.jsx
   ↓
2. Clicks "Create Election" button
   ↓
3. Frontend calls: electionService.createElection({ title, dates, ... })
   ↓
4. Axios sends: POST http://localhost:5000/api/elections
   Headers: { Authorization: "Bearer {JWT_TOKEN}" }
   Body: { title: "...", startDate: "...", endDate: "..." }
   ↓
5. Spring Boot receives request at ElectionController.create()
   ↓
6. ElectionService validates data and processes
   ↓
7. ElectionRepository.save() → PostgreSQL database
   INSERT INTO elections (title, start_date, end_date, ...)
   ↓
8. Backend returns: { success: true, data: { _id: "...", title: "..." } }
   ↓
9. Frontend receives response
   ↓
10. Shows success message → Redirects to Ballot Designer
```

---

## 5. AUTHENTICATION FLOW

```
1. User visits /login page
   ↓
2. Enters username: "admin", password: "admin123"
   ↓
3. Frontend sends: POST /api/auth/login { username, password }
   ↓
4. AuthController validates credentials
   ↓
5. AuthService generates JWT token with role "ADMIN"
   ↓
6. Returns: { token: "eyJhbGci...", role: "ADMIN" }
   ↓
7. Frontend stores in localStorage: { token, role }
   ↓
8. AuthContext updates global state
   ↓
9. User redirected to /admin/election/view
   ↓
10. All future API calls include: Authorization: Bearer {token}
```

---

## 6. KEY FEATURES IMPLEMENTED

### **Version Management System**
- Ballots have versions (v1, v2, v3...)
- Each version stored separately
- Can rollback to previous versions
- Only one version can be published at a time

### **Status Management**
- Elections have status: draft → published → active → ended
- Status calculated based on current time vs start/end dates
- Real-time progress bars show election progress

### **Role-Based Access Control**
- AdminRoute protects admin pages
- Checks JWT token and role
- Redirects to login if not authenticated

### **Audit Trail**
- All actions logged in `audit_logs` table
- Tracks who did what and when

---

## 7. TECHNICAL HIGHLIGHTS

### **Frontend Technologies**
- **React 19**: Modern UI library with hooks
- **React Router**: Client-side routing
- **Axios**: HTTP client with interceptors for auth
- **Framer Motion**: Smooth animations
- **Styled Components**: CSS-in-JS styling

### **Backend Technologies**
- **Spring Boot 3.2.5**: Java framework
- **Spring Data JPA**: Database ORM
- **PostgreSQL**: Relational database
- **JWT**: Stateless authentication

### **Architecture Patterns**
- **RESTful API**: Standard HTTP methods and URLs
- **MVC Pattern**: Model-View-Controller separation
- **Service Layer**: Business logic encapsulation
- **Repository Pattern**: Data access abstraction

---

## 8. DATABASE STRUCTURE

### **Tables**
- **elections**: Stores election metadata
- **ballots**: Stores ballot versions (linked to elections)
- **candidates**: Stores candidate info (linked to ballots)
- **audit_logs**: Stores action history

### **Relationships**
```
Election (1) ──→ (Many) Ballots
Ballot (1) ──→ (Many) Candidates
```

---

## 9. SECURITY FEATURES

1. **JWT Authentication**: Token-based stateless auth
2. **Protected Routes**: AdminRoute checks authentication
3. **CORS Configuration**: Allows frontend to call backend
4. **Authorization Headers**: All API calls include token
5. **Input Validation**: Backend validates all inputs

---

## 10. PRESENTATION TALKING POINTS

### **What I Built**
- Full-stack voting system admin interface
- React frontend with modern UI/UX
- Spring Boot REST API backend
- PostgreSQL database
- JWT authentication system
- Ballot version management system

### **How It Works**
- Frontend sends HTTP requests to backend
- Backend processes requests and queries database
- Data flows: User → Frontend → Backend → Database → Backend → Frontend → User
- Authentication ensures only admins can access admin features

### **Key Achievements**
- Clean separation of frontend and backend
- RESTful API design
- Version management for ballots
- Real-time status updates
- Secure authentication flow
- Responsive and animated UI

---

## Quick Demo Flow

1. **Login**: Show login page → Enter credentials → Get redirected
2. **Create Election**: Show form → Fill details → Submit → Success message
3. **Design Ballot**: Select election → Add candidates → Save version
4. **View Elections**: Show dashboard → Click election → See details
5. **Publish**: Click publish → See status change → Show ballot versions
6. **Rollback**: Show version history → Rollback to previous → See new version

---

This system demonstrates understanding of:
- Full-stack development
- REST API design
- Database relationships
- Authentication & authorization
- State management
- Modern React patterns
- Spring Boot architecture
