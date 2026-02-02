import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import electionRoutes from './routes/electionRoutes.js';
import ballotRoutes from './routes/ballotRoutes.js';
import authRoutes from './routes/authRoutes.js';

dotenv.config();

const app = express();

// --------------------
// Middleware
// --------------------
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --------------------
// Routes
// --------------------
app.use('/api/auth', authRoutes);     // ✅ REQUIRED (JWT LOGIN)
app.use('/api', electionRoutes);      // elections
app.use('/api', ballotRoutes);        // ballots

// --------------------
// Health check
// --------------------
app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'API is running' });
});

// --------------------
// Global error handler
// --------------------
app.use((err, req, res, _next) => {
  const statusCode = err.status || 500;

  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// --------------------
// Start server
// --------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
