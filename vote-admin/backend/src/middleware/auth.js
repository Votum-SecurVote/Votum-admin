import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret';

console.log('🔑 JWT_SECRET USED BY SERVER:', JWT_SECRET);

// --------------------------------------------------
// Authenticate JWT
// --------------------------------------------------
export function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Missing or invalid Authorization header',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET);

    // 🔒 Normalize payload (VERY IMPORTANT)
    req.user = {
      id: payload.id,
      role: payload.role,
    };

    if (!req.user.id || !req.user.role) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token payload',
      });
    }

    next();
  } catch (err) {
    console.error('❌ JWT VERIFY ERROR:', err.message);
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token',
    });
  }
}

// --------------------------------------------------
// Require ADMIN role
// --------------------------------------------------
export function requireAdmin(req, res, next) {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      error: 'Forbidden: Admins only',
    });
  }
  next();
}
