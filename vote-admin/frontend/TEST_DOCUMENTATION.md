# Frontend Unit Testing Documentation

## Overview
This document provides comprehensive test case documentation for all frontend components and pages in the Votum Admin application.

## Test Setup
- **Testing Framework**: Vitest
- **Testing Library**: React Testing Library
- **Test Environment**: jsdom
- **Test Location**: `src/__tests__/`

---

## Test Cases

### 1. Loader Component (`Loader.test.jsx`)

#### Test Case 1.1: Renders default loading message and spinner structure
- **Input**: Component rendered without props
- **Expected Output**: 
  - Default message "Loading..." is displayed
  - Loader container has 2 children (spinner and message)
- **Status**: ✅ PASSED

#### Test Case 1.2: Renders custom message when message prop is provided
- **Input**: `<Loader message="Fetching data..." />`
- **Expected Output**: 
  - Custom message "Fetching data..." is displayed
  - Default message "Loading..." is not displayed
- **Status**: ✅ PASSED

#### Test Case 1.3: Handles empty message without crashing (edge case)
- **Input**: `<Loader message="" />`
- **Expected Output**: 
  - Component renders without crashing
  - Text span is rendered with empty content
- **Status**: ✅ PASSED

#### Test Case 1.4: Does not change message on user interaction (no side effects)
- **Input**: Click event on loader container
- **Expected Output**: 
  - Message remains unchanged
  - No side effects occur
- **Status**: ✅ PASSED

---

### 2. Navbar Component (`Navbar.test.jsx`)

#### Test Case 2.1: Renders navbar with logo and navigation links
- **Input**: Component rendered
- **Expected Output**: 
  - Logo "SecureVote Admin" is displayed
  - Navigation links (Create, Ballot, View) are displayed
- **Status**: ✅ PASSED

#### Test Case 2.2: Shows Sign In button when user is not authenticated
- **Input**: No user in localStorage
- **Expected Output**: 
  - "Sign In" button is displayed
  - "Logout" button is not displayed
- **Status**: ✅ PASSED

#### Test Case 2.3: Shows Logout button when admin user is authenticated
- **Input**: `localStorage.setItem('auth', JSON.stringify({ id: '1', role: 'ADMIN', token: 'test-token' }))`
- **Expected Output**: 
  - "Logout" button is displayed
  - "Sign In" button is not displayed
- **Status**: ✅ PASSED

#### Test Case 2.4: Disables admin-only links when user is not admin
- **Input**: User with role 'USER' in localStorage
- **Expected Output**: 
  - Admin links have disabled state
  - Tooltip shows permission message
- **Status**: ✅ PASSED

#### Test Case 2.5: Enables admin links when user is admin
- **Input**: User with role 'ADMIN' in localStorage
- **Expected Output**: 
  - Admin links are enabled
  - No disabled tooltip
- **Status**: ✅ PASSED

#### Test Case 2.6: Navigates to login page when Sign In button is clicked
- **Input**: Click on "Sign In" button
- **Expected Output**: 
  - `navigate('/login')` is called
- **Status**: ✅ PASSED

#### Test Case 2.7: Calls logout and navigates when Logout button is clicked
- **Input**: Click on "Logout" button (admin user)
- **Expected Output**: 
  - `navigate('/elections/public')` is called
  - Auth is cleared from localStorage
- **Status**: ✅ PASSED

#### Test Case 2.8: Navigates to public elections when logo is clicked
- **Input**: Click on logo
- **Expected Output**: 
  - `navigate('/elections/public')` is called
- **Status**: ✅ PASSED

#### Test Case 2.9: Highlights active navigation link based on current pathname
- **Input**: Current pathname `/admin/election/create`
- **Expected Output**: 
  - "Create" link has 'active' class
- **Status**: ✅ PASSED

#### Test Case 2.10: Handles edge case: empty user object
- **Input**: `localStorage.setItem('auth', JSON.stringify({}))`
- **Expected Output**: 
  - Shows "Sign In" button (role is not ADMIN)
- **Status**: ✅ PASSED

#### Test Case 2.11: Handles edge case: invalid localStorage auth data
- **Input**: `localStorage.setItem('auth', 'invalid-json')`
- **Expected Output**: 
  - Handles gracefully and shows "Sign In" button
- **Status**: ✅ PASSED

---

### 3. AnimatedCard Component (`AnimatedCard.test.jsx`)

#### Test Case 3.1: Renders children content correctly
- **Input**: `<AnimatedCard><div>Test Content</div></AnimatedCard>`
- **Expected Output**: 
  - "Test Content" is displayed
- **Status**: ✅ PASSED

#### Test Case 3.2: Renders multiple children elements
- **Input**: Multiple children (h1, p, button)
- **Expected Output**: 
  - All children are rendered
- **Status**: ✅ PASSED

#### Test Case 3.3: Renders with default delay prop
- **Input**: Component without delay prop
- **Expected Output**: 
  - Component renders successfully
- **Status**: ✅ PASSED

#### Test Case 3.4: Applies custom delay prop
- **Input**: `<AnimatedCard delay={0.5}>`
- **Expected Output**: 
  - Component renders with custom delay
- **Status**: ✅ PASSED

#### Test Case 3.5: Passes through additional props
- **Input**: `data-testid="custom-card" className="custom-class"`
- **Expected Output**: 
  - Props are applied to component
- **Status**: ✅ PASSED

#### Test Case 3.6: Handles empty children gracefully
- **Input**: `<AnimatedCard />`
- **Expected Output**: 
  - Component renders without crashing
- **Status**: ✅ PASSED

#### Test Case 3.7: Handles null children
- **Input**: `<AnimatedCard>{null}</AnimatedCard>`
- **Expected Output**: 
  - Component renders without crashing
- **Status**: ✅ PASSED

#### Test Case 3.8: Handles string children
- **Input**: `<AnimatedCard>Simple Text Content</AnimatedCard>`
- **Expected Output**: 
  - String content is displayed
- **Status**: ✅ PASSED

#### Test Case 3.9: Handles zero delay value
- **Input**: `delay={0}`
- **Expected Output**: 
  - Component renders successfully
- **Status**: ✅ PASSED

#### Test Case 3.10: Handles negative delay value (edge case)
- **Input**: `delay={-1}`
- **Expected Output**: 
  - Component renders successfully
- **Status**: ✅ PASSED

---

### 4. PageTransition Component (`PageTransition.test.jsx`)

#### Test Case 4.1: Renders children content correctly
- **Input**: `<PageTransition><div>Page Content</div></PageTransition>`
- **Expected Output**: 
  - "Page Content" is displayed
- **Status**: ✅ PASSED

#### Test Case 4.2: Renders multiple children elements
- **Input**: Multiple children (header, main, footer)
- **Expected Output**: 
  - All children are rendered
- **Status**: ✅ PASSED

#### Test Case 4.3: Applies correct inline styles
- **Input**: Component rendered
- **Expected Output**: 
  - Styles: width: '100%', minHeight: 'calc(100vh - 64px)', paddingTop: '64px'
- **Status**: ✅ PASSED

#### Test Case 4.4: Handles empty children gracefully
- **Input**: `<PageTransition />`
- **Expected Output**: 
  - Component renders without crashing
- **Status**: ✅ PASSED

#### Test Case 4.5: Handles null children
- **Input**: `<PageTransition>{null}</PageTransition>`
- **Expected Output**: 
  - Component renders without crashing
- **Status**: ✅ PASSED

#### Test Case 4.6: Handles string children
- **Input**: `<PageTransition>Simple Text</PageTransition>`
- **Expected Output**: 
  - String content is displayed
- **Status**: ✅ PASSED

#### Test Case 4.7: Handles complex nested children structure
- **Input**: Nested div structure with h1 and section
- **Expected Output**: 
  - All nested elements are rendered
- **Status**: ✅ PASSED

#### Test Case 4.8: Renders form elements as children
- **Input**: Form with input and button
- **Expected Output**: 
  - Form elements are rendered correctly
- **Status**: ✅ PASSED

#### Test Case 4.9: Handles array of children
- **Input**: Array of div elements
- **Expected Output**: 
  - All array elements are rendered
- **Status**: ✅ PASSED

#### Test Case 4.10: Maintains component structure
- **Input**: Child with data-testid
- **Expected Output**: 
  - Component structure is maintained
- **Status**: ✅ PASSED

---

### 5. Login Page (`Login.test.jsx`)

#### Test Case 5.1: Renders login form with all required elements
- **Input**: Component rendered
- **Expected Output**: 
  - "Admin Login" heading
  - Username input field
  - Password input field
  - Login button
- **Status**: ✅ PASSED

#### Test Case 5.2: Allows user to type in username field
- **Input**: Type "admin" in username field
- **Expected Output**: 
  - Username field contains "admin"
- **Status**: ✅ PASSED

#### Test Case 5.3: Allows user to type in password field
- **Input**: Type "password123" in password field
- **Expected Output**: 
  - Password field contains "password123"
- **Status**: ✅ PASSED

#### Test Case 5.4: Shows error message when login fails
- **Input**: Invalid credentials submitted
- **Expected Output**: 
  - Error message "Invalid credentials" is displayed
- **Status**: ✅ PASSED

#### Test Case 5.5: Successfully logs in and navigates on valid credentials
- **Input**: Valid credentials (admin/password123)
- **Expected Output**: 
  - `loginAdmin` is called with correct credentials
  - Navigates to '/admin/election/view'
  - Auth stored in localStorage
- **Status**: ✅ PASSED

#### Test Case 5.6: Shows loading state during login
- **Input**: Form submission initiated
- **Expected Output**: 
  - "Logging in..." text is displayed
  - Submit button is disabled
- **Status**: ✅ PASSED

#### Test Case 5.7: Disables submit button when loading
- **Input**: Form submission in progress
- **Expected Output**: 
  - Submit button is disabled
- **Status**: ✅ PASSED

#### Test Case 5.8: Clears error message on new submission attempt
- **Input**: First submission fails, second succeeds
- **Expected Output**: 
  - Error message is cleared on second attempt
- **Status**: ✅ PASSED

#### Test Case 5.9: Handles generic error message when error has no message
- **Input**: Error without message property
- **Expected Output**: 
  - Generic error message "Login failed. Please try again." is displayed
- **Status**: ✅ PASSED

#### Test Case 5.10: Prevents form submission with empty fields
- **Input**: Submit button clicked without filling fields
- **Expected Output**: 
  - HTML5 validation prevents submission
  - `loginAdmin` is not called
- **Status**: ✅ PASSED

#### Test Case 5.11: Handles edge case: empty username after typing
- **Input**: Type text then clear username field
- **Expected Output**: 
  - Username field is empty
- **Status**: ✅ PASSED

---

### 6. ElectionCreate Page (`ElectionCreate.test.jsx`)

#### Test Case 6.1: Renders election creation form with all fields
- **Input**: Component rendered
- **Expected Output**: 
  - All form fields are displayed (title, description, startDate, endDate, votingRules)
  - Submit button is displayed
- **Status**: ✅ PASSED

#### Test Case 6.2: Allows user to input form fields
- **Input**: Type in title and description fields
- **Expected Output**: 
  - Fields contain typed values
- **Status**: ✅ PASSED

#### Test Case 6.3: Shows loader when submitting form
- **Input**: Form submission initiated
- **Expected Output**: 
  - Loader with "Creating election..." message is displayed
- **Status**: ✅ PASSED

#### Test Case 6.4: Successfully creates election and shows success message
- **Input**: Valid form data submitted
- **Expected Output**: 
  - Success message with election ID is displayed
  - Election ID stored in localStorage
- **Status**: ✅ PASSED

#### Test Case 6.5: Handles form submission error
- **Input**: API call fails
- **Expected Output**: 
  - Alert with error message is displayed
- **Status**: ✅ PASSED

#### Test Case 6.6: Converts IST datetime to UTC format
- **Input**: IST datetime values in form
- **Expected Output**: 
  - Dates are converted to UTC format in API call
- **Status**: ✅ PASSED

#### Test Case 6.7: Requires title and dates fields
- **Input**: Submit without required fields
- **Expected Output**: 
  - HTML5 validation prevents submission
- **Status**: ✅ PASSED

#### Test Case 6.8: Handles empty optional fields
- **Input**: Submit with only required fields filled
- **Expected Output**: 
  - Form submits successfully
  - Optional fields are empty strings
- **Status**: ✅ PASSED

---

### 7. AdminRoute Component (`AdminRoute.test.jsx`)

#### Test Case 7.1: Allows access when user is authenticated admin
- **Input**: `localStorage.setItem('auth', JSON.stringify({ token: 'test-token', role: 'ADMIN' }))`
- **Expected Output**: 
  - Protected content is displayed
  - No redirect occurs
- **Status**: ✅ PASSED

#### Test Case 7.2: Redirects to login when no auth is stored
- **Input**: No auth in localStorage
- **Expected Output**: 
  - Redirects to /login
  - Protected content is not displayed
- **Status**: ✅ PASSED

#### Test Case 7.3: Redirects to login when token is missing
- **Input**: `localStorage.setItem('auth', JSON.stringify({ role: 'ADMIN' }))`
- **Expected Output**: 
  - Redirects to /login
- **Status**: ✅ PASSED

#### Test Case 7.4: Redirects to login when role is not ADMIN
- **Input**: `localStorage.setItem('auth', JSON.stringify({ token: 'test-token', role: 'USER' }))`
- **Expected Output**: 
  - Redirects to /login
- **Status**: ✅ PASSED

#### Test Case 7.5: Redirects to login when role is missing
- **Input**: `localStorage.setItem('auth', JSON.stringify({ token: 'test-token' }))`
- **Expected Output**: 
  - Redirects to /login
- **Status**: ✅ PASSED

#### Test Case 7.6: Handles corrupted localStorage data gracefully
- **Input**: `localStorage.setItem('auth', 'invalid-json')`
- **Expected Output**: 
  - Redirects to /login
  - No errors thrown
- **Status**: ✅ PASSED

#### Test Case 7.7: Handles empty auth object
- **Input**: `localStorage.setItem('auth', JSON.stringify({}))`
- **Expected Output**: 
  - Redirects to /login
- **Status**: ✅ PASSED

#### Test Case 7.8: Handles null token value
- **Input**: `localStorage.setItem('auth', JSON.stringify({ token: null, role: 'ADMIN' }))`
- **Expected Output**: 
  - Redirects to /login
- **Status**: ✅ PASSED

#### Test Case 7.9: Handles empty string token
- **Input**: `localStorage.setItem('auth', JSON.stringify({ token: '', role: 'ADMIN' }))`
- **Expected Output**: 
  - Redirects to /login
- **Status**: ✅ PASSED

#### Test Case 7.10: Case-sensitive role check (admin vs ADMIN)
- **Input**: `localStorage.setItem('auth', JSON.stringify({ token: 'test-token', role: 'admin' }))`
- **Expected Output**: 
  - Redirects to /login (case-sensitive check)
- **Status**: ✅ PASSED

---

### 8. ElectionView Page (`ElectionView.test.jsx`)

#### Test Case 8.1: Renders loading state initially
- **Input**: Component rendered
- **Expected Output**: 
  - Loader with "Loading dashboard..." message is displayed
- **Status**: ✅ PASSED

#### Test Case 8.2: Displays election dashboard after loading
- **Input**: Mock elections data
- **Expected Output**: 
  - "Election Dashboard" heading is displayed
  - Election list is displayed
- **Status**: ✅ PASSED

#### Test Case 8.3: Displays statistics correctly
- **Input**: Elections with different statuses
- **Expected Output**: 
  - Total, Published, and Draft counts are displayed correctly
- **Status**: ✅ PASSED

#### Test Case 8.4: Displays "No elections found" when list is empty
- **Input**: Empty elections array
- **Expected Output**: 
  - "No elections found" message is displayed
- **Status**: ✅ PASSED

#### Test Case 8.5: Selects first election by default
- **Input**: Multiple elections in list
- **Expected Output**: 
  - First election is automatically selected
  - Ballots are loaded for first election
- **Status**: ✅ PASSED

#### Test Case 8.6: Allows selecting different election
- **Input**: Click on different election in list
- **Expected Output**: 
  - Selected election changes
  - Ballots are loaded for new selection
- **Status**: ✅ PASSED

#### Test Case 8.7: Displays election details when selected
- **Input**: Election selected
- **Expected Output**: 
  - Election title, description, dates are displayed
  - Election ID is shown
- **Status**: ✅ PASSED

#### Test Case 8.8: Shows publish button for draft elections
- **Input**: Election with status 'DRAFT'
- **Expected Output**: 
  - Publish button is displayed
- **Status**: ✅ PASSED

#### Test Case 8.9: Shows unpublish button for published elections
- **Input**: Election with status 'PUBLISHED'
- **Expected Output**: 
  - Unpublish button is displayed
- **Status**: ✅ PASSED

#### Test Case 8.10: Publishes election when publish button is clicked
- **Input**: Click on publish button
- **Expected Output**: 
  - `publishElection` service is called
  - Elections are reloaded
- **Status**: ✅ PASSED

#### Test Case 8.11: Deletes election when delete button is clicked and confirmed
- **Input**: Click delete button, confirm dialog
- **Expected Output**: 
  - Confirmation dialog appears
  - `deleteElection` service is called
  - Elections are reloaded
- **Status**: ✅ PASSED

#### Test Case 8.12: Does not delete election when confirmation is cancelled
- **Input**: Click delete button, cancel confirmation
- **Expected Output**: 
  - Confirmation dialog appears
  - `deleteElection` is not called
- **Status**: ✅ PASSED

#### Test Case 8.13: Loads ballots for selected election
- **Input**: Election selected
- **Expected Output**: 
  - `getElectionBallots` is called with election ID
- **Status**: ✅ PASSED

#### Test Case 8.14: Displays "No ballots available" when no ballots exist
- **Input**: Selected election with no ballots
- **Expected Output**: 
  - "No ballots available" message is displayed
- **Status**: ✅ PASSED

#### Test Case 8.15: Handles API errors gracefully
- **Input**: API call fails
- **Expected Output**: 
  - Error is handled gracefully
  - "No elections found" is displayed
- **Status**: ✅ PASSED

#### Test Case 8.16: Publish button is clickable and triggers action
- **Input**: Click on publish button
- **Expected Output**: 
  - Button is interactive
  - Action is triggered
- **Status**: ✅ PASSED

---

### 9. BallotDesigner Page (`BallotDesigner.test.jsx`)

#### Test Case 9.1: Renders loading state initially
- **Input**: Component rendered
- **Expected Output**: 
  - Loader with "Loading workspace..." message is displayed
- **Status**: ✅ PASSED

#### Test Case 9.2: Displays ballot designer header
- **Input**: Component loaded
- **Expected Output**: 
  - "Ballot Designer" heading is displayed
  - Description text is displayed
- **Status**: ✅ PASSED

#### Test Case 9.3: Displays election selector dropdown
- **Input**: Multiple elections available
- **Expected Output**: 
  - Dropdown selector is displayed
  - First election is selected by default
- **Status**: ✅ PASSED

#### Test Case 9.4: Loads ballots when election is selected
- **Input**: Election selected from dropdown
- **Expected Output**: 
  - `getElectionBallots` is called with election ID
- **Status**: ✅ PASSED

#### Test Case 9.5: Displays empty state when no ballot is selected
- **Input**: No ballot selected
- **Expected Output**: 
  - Empty state message is displayed
  - Instructions to select/create ballot are shown
- **Status**: ✅ PASSED

#### Test Case 9.6: Allows creating a new ballot
- **Input**: Enter ballot title and click create
- **Expected Output**: 
  - `createBallot` service is called with correct data
  - New ballot is added to list
- **Status**: ✅ PASSED

#### Test Case 9.7: Shows alert when trying to create ballot without title
- **Input**: Click create button without entering title
- **Expected Output**: 
  - Alert "Enter a title" is displayed
  - Ballot is not created
- **Status**: ✅ PASSED

#### Test Case 9.8: Displays ballot list when ballots exist
- **Input**: Ballots available for election
- **Expected Output**: 
  - Ballot items are displayed in sidebar
  - Ballot titles and candidate counts are shown
- **Status**: ✅ PASSED

#### Test Case 9.9: Allows selecting a ballot to edit
- **Input**: Click on ballot item
- **Expected Output**: 
  - Ballot is selected
  - Candidates are loaded for that ballot
- **Status**: ✅ PASSED

#### Test Case 9.10: Displays candidate form when ballot is selected
- **Input**: Ballot selected
- **Expected Output**: 
  - "Add Candidate" form is displayed
  - Name and Party input fields are shown
  - File upload for image is available
- **Status**: ✅ PASSED

#### Test Case 9.11: Allows adding a candidate to ballot
- **Input**: Enter candidate name and party, click add
- **Expected Output**: 
  - `createCandidate` service is called with correct data
  - Candidate is added to ballot
- **Status**: ✅ PASSED

#### Test Case 9.12: Shows alert when adding candidate without name or party
- **Input**: Click add button without filling required fields
- **Expected Output**: 
  - Alert "Name and Party required" is displayed
  - Candidate is not created
- **Status**: ✅ PASSED

#### Test Case 9.13: Displays candidates list when candidates exist
- **Input**: Ballot with candidates selected
- **Expected Output**: 
  - Candidate names and parties are displayed
  - Candidate count is shown
- **Status**: ✅ PASSED

#### Test Case 9.14: Displays empty candidates message when no candidates
- **Input**: Ballot with no candidates
- **Expected Output**: 
  - "No candidates in this ballot yet" message is displayed
- **Status**: ✅ PASSED

#### Test Case 9.15: Displays remove button for candidates
- **Input**: Ballot with candidates selected
- **Expected Output**: 
  - Candidates are displayed with remove functionality
  - Candidate information is visible
- **Status**: ✅ PASSED

#### Test Case 9.16: Handles file upload for candidate image
- **Input**: Select image file
- **Expected Output**: 
  - File input accepts the file
  - File is processed
- **Status**: ✅ PASSED

#### Test Case 9.17: Disables create ballot button when no election selected
- **Input**: No election selected
- **Expected Output**: 
  - Create ballot button is disabled
- **Status**: ✅ PASSED

#### Test Case 9.18: Handles API errors when loading elections
- **Input**: API call fails
- **Expected Output**: 
  - Error is handled gracefully
  - Loading state ends
- **Status**: ✅ PASSED

---

## Test Execution Summary

### Total Test Files: 9
1. Loader.test.jsx - 4 tests ✅
2. Navbar.test.jsx - 11 tests ✅
3. AnimatedCard.test.jsx - 10 tests ✅
4. PageTransition.test.jsx - 10 tests ✅
5. Login.test.jsx - 11 tests ✅
6. ElectionCreate.test.jsx - 8 tests ✅
7. AdminRoute.test.jsx - 10 tests ✅
8. ElectionView.test.jsx - 16 tests ✅
9. BallotDesigner.test.jsx - 18 tests ✅

### Total Test Cases: 98
- **Passed**: 98 ✅
- **Failed**: 0 ❌
- **Skipped**: 0 ⏭️

---

## Running Tests

```bash
# Run all tests
npm run test

# Run specific test file
npm run test -- src/__tests__/Loader.test.jsx

# Run tests in watch mode
npm run test -- --watch

# Run tests with coverage
npm run test:coverage
```

---

## Test Coverage Areas

1. **Rendering Tests**: Verify components render correctly
2. **User Interaction Tests**: Test user inputs and interactions
3. **Conditional Rendering**: Test different states and conditions
4. **Error Handling**: Test error scenarios and edge cases
5. **API Mocking**: Mock external API calls
6. **Navigation**: Test routing and navigation
7. **State Management**: Test component state changes
8. **Edge Cases**: Test boundary conditions and invalid inputs

---

## Notes

- All API calls are mocked using Vitest's `vi.mock()`
- React Router hooks are mocked for navigation testing
- localStorage is cleared before each test
- Tests use React Testing Library best practices
- All tests follow the Arrange-Act-Assert pattern

---

**Last Updated**: February 2026
**Test Framework Version**: Vitest 4.0.18
**React Testing Library Version**: 16.3.2
