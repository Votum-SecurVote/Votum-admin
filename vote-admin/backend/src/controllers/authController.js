import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret';

/**
 * @desc    Admin login (temporary / demo-safe)
 * @route   POST /api/auth/login
 */
export const adminLogin = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  // 🔒 DEMO LOGIN (for project / viva)
  if (username !== 'admin' || password !== 'admin123') {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  const token = jwt.sign(
    {
      id: 'admin-001',
      role: 'ADMIN',
    },
    JWT_SECRET,
    { expiresIn: '2h' }
  );

  res.json({
    success: true,
    token,
    role: 'ADMIN',
  });
});
