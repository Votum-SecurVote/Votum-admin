## Secure Voting Admin – UI Only

This branch contains **only the React admin frontend**, running entirely in the browser with **mock data** and **no backend required**.

### Run the UI

```bash
cd frontend
npm install
npm run dev
```

Then open `http://localhost:5173/login`, sign in with **any** username/password, and you can:

- View the demo election and ballot dashboard
- Create mock elections
- Design ballots and candidates using static in-memory data

Your backend teammate can plug in real APIs later by replacing the mock services in:

- `frontend/src/services/authService.js`
- `frontend/src/services/electionService.js`
