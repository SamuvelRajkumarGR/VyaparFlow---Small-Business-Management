const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'vyaparflow_jwt_secret_production_key_safe_2026';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

// Generate token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRE,
  });
};

// Cookie options for secure session handling
const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: isProduction, // HTTPS in production
    sameSite: isProduction ? 'strict' : 'lax',
    path: '/',
  };
};

// Protect middleware - validates JWT and active account status
const protect = async (req, res, next) => {
  let token;

  // 1. Check HttpOnly cookie
  if (req.cookies && req.cookies.vyapar_token) {
    token = req.cookies.vyapar_token;
  }
  // 2. Check Authorization header (Bearer token)
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this resource. Please log in.',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The account associated with this session no longer exists.',
      });
    }

    // Check account status
    if (user.accountStatus === 'suspended') {
      return res.status(403).json({
        success: false,
        accountStatus: 'suspended',
        message: 'Your account has been suspended by the administrator. All business operations are disabled.',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session. Please log in again.',
    });
  }
};

// Authorize specific roles (e.g. 'admin')
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: role '${req.user?.role || 'anonymous'}' is not authorized to access this endpoint.`,
      });
    }
    next();
  };
};

module.exports = {
  protect,
  authorize,
  generateToken,
  getCookieOptions,
};
