const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { generateToken, getCookieOptions } = require('../middleware/auth');
const { isEmailConfigured, sendPasswordResetEmail } = require('../utils/mailer');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || '');

// Helper to format safe user response
const sanitizeUser = (user) => ({
  id: user._id,
  _id: user._id,
  name: user.name,
  businessName: user.businessName,
  email: user.email,
  phone: user.phone || '',
  role: user.role,
  accountStatus: user.accountStatus,
  authProviders: user.authProviders,
  googleProfilePic: user.googleProfilePic || '',
  currency: user.currency || '₹',
  createdAt: user.createdAt,
});

// @desc    Register a new business user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, businessName, email, password, phone } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Full name is required' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email address is required' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists. Please log in instead.',
      });
    }

    // Hash password
    const passwordHash = await User.hashPassword(password);

    // Create user - strictly force 'user' role
    const newUser = await User.create({
      name: name.trim(),
      businessName: businessName && businessName.trim() ? businessName.trim() : `${name.trim()}'s Business`,
      email: normalizedEmail,
      phone: phone ? phone.trim() : '',
      passwordHash,
      role: 'user', // NEVER trust role from body
      accountStatus: 'active',
      authProviders: ['local'],
      lastLoginAt: new Date(),
    });

    const token = generateToken(newUser._id);
    res.cookie('vyapar_token', token, getCookieOptions());

    res.status(201).json({
      success: true,
      message: 'Account registered successfully! Welcome to VyaparFlow.',
      token,
      user: sanitizeUser(newUser),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Log in existing user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // If user registered only with Google
    if (!user.passwordHash) {
      return res.status(400).json({
        success: false,
        message: 'This account was created via Google Sign-In. Please click "Continue with Google" to access your dashboard.',
      });
    }

    // Verify password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Check account status
    if (user.accountStatus === 'suspended') {
      return res.status(403).json({
        success: false,
        accountStatus: 'suspended',
        message: 'Your account has been suspended by the administrator. Please contact support.',
      });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = generateToken(user._id);
    res.cookie('vyapar_token', token, getCookieOptions());

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate with Google OAuth ID token
// @route   POST /api/auth/google
// @access  Public
const googleAuth = async (req, res, next) => {
  try {
    const { credential, businessName } = req.body;

    if (typeof credential !== 'string' || !credential) {
      return res.status(400).json({
        success: false,
        message: 'Google ID token credential is required',
      });
    }

    const clientId = (process.env.GOOGLE_CLIENT_ID || '').trim();
    if (!clientId || clientId === 'your_google_client_id_here') {
      return res.status(503).json({
        success: false,
        message: 'Google sign-in is not configured. Set GOOGLE_CLIENT_ID on the backend.',
      });
    }

    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: clientId,
      });
      payload = ticket.getPayload();
    } catch (verifyErr) {
      return res.status(401).json({
        success: false,
        message: 'Google token verification failed. Please sign in again.',
      });
    }

    if (
      !payload?.sub ||
      typeof payload.email !== 'string' ||
      payload.email_verified !== true
    ) {
      return res.status(401).json({
        success: false,
        message: 'Google must provide a verified email address to sign in.',
      });
    }

    const { sub: googleSubject, email, name, picture } = payload;
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Check if user already exists with this Google Subject ID
    let user = await User.findOne({ googleSubject });

    if (user) {
      if (user.accountStatus === 'suspended') {
        return res.status(403).json({
          success: false,
          accountStatus: 'suspended',
          message: 'Your account has been suspended by the administrator.',
        });
      }

      user.lastLoginAt = new Date();
      if (picture && !user.googleProfilePic) user.googleProfilePic = picture;
      await user.save();

      const token = generateToken(user._id);
      res.cookie('vyapar_token', token, getCookieOptions());

      return res.status(200).json({
        success: true,
        message: 'Signed in with Google successfully',
        token,
        user: sanitizeUser(user),
      });
    }

    // 2. Check if a user with this email already exists (Safe Account Linking)
    user = await User.findOne({ email: normalizedEmail });

    if (user) {
      if (user.accountStatus === 'suspended') {
        return res.status(403).json({
          success: false,
          accountStatus: 'suspended',
          message: 'Your account has been suspended by the administrator.',
        });
      }

      // Link Google Subject to existing account
      user.googleSubject = googleSubject;
      if (!user.authProviders.includes('google')) {
        user.authProviders.push('google');
      }
      if (picture && !user.googleProfilePic) user.googleProfilePic = picture;
      user.lastLoginAt = new Date();
      await user.save();

      const token = generateToken(user._id);
      res.cookie('vyapar_token', token, getCookieOptions());

      return res.status(200).json({
        success: true,
        message: 'Linked Google account to your existing VyaparFlow profile successfully',
        token,
        user: sanitizeUser(user),
      });
    }

    // 3. New Google User Registration
    const finalBusinessName = typeof businessName === 'string' && businessName.trim()
      ? businessName.trim()
      : `${name || 'Vyapar'}'s Business`;

    const newUser = await User.create({
      name: name || 'Google User',
      businessName: finalBusinessName,
      email: normalizedEmail,
      googleSubject,
      googleProfilePic: picture || '',
      authProviders: ['google'],
      role: 'user', // NEVER assign admin
      accountStatus: 'active',
      lastLoginAt: new Date(),
    });

    const token = generateToken(newUser._id);
    res.cookie('vyapar_token', token, getCookieOptions());

    res.status(201).json({
      success: true,
      message: 'Welcome to VyaparFlow! Account created via Google Sign-In.',
      token,
      user: sanitizeUser(newUser),
      needsOnboarding: !businessName,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Log out user & clear session cookie
// @route   POST /api/auth/logout
// @access  Public
const logout = async (req, res) => {
  res.cookie('vyapar_token', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

// @desc    Get current logged in user session
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: sanitizeUser(req.user),
  });
};

// @desc    Update business profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, businessName, phone, currency } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name.trim();
    if (businessName) user.businessName = businessName.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (currency) user.currency = currency;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Business profile updated successfully',
      user: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long',
      });
    }

    const user = await User.findById(req.user._id).select('+passwordHash');

    // If user previously only logged in with Google, they can set a password without currentPassword
    if (user.passwordHash) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is required',
        });
      }
      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Incorrect current password',
        });
      }
    }

    user.passwordHash = await User.hashPassword(newPassword);
    if (!user.authProviders.includes('local')) {
      user.authProviders.push('local');
    }
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password - request reset token
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide your email address' });
    }

    if (!isEmailConfigured()) {
      return res.status(503).json({
        success: false,
        message: 'Password reset email is temporarily unavailable. Please contact support.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      // Do not reveal whether user exists for security
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, password reset instructions will be sent.',
      });
    }

    // Store only a hash so a database read cannot be used to reset the password.
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
    await user.save();

    const clientUrl = (process.env.CLIENT_URL || '').replace(/\/+$/, '');
    if (!clientUrl) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      return res.status(503).json({
        success: false,
        message: 'Password reset email is temporarily unavailable. Please contact support.',
      });
    }

    const resetUrl = `${clientUrl}/reset-password?token=${encodeURIComponent(resetToken)}`;
    try {
      await sendPasswordResetEmail({
        email: user.email,
        name: user.name,
        resetUrl,
      });
    } catch (emailError) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      console.error('Failed to deliver password reset email:', emailError.message);
      return res.status(503).json({
        success: false,
        message: 'Password reset email could not be sent right now. Please try again later.',
      });
    }

    // Log the request
    await AuditLog.create({
      actor: user._id,
      actorEmail: user.email,
      action: 'PASSWORD_RESET_REQUESTED',
      details: { ip: req.ip },
      ipAddress: req.ip || '',
      userAgent: req.get('User-Agent') || '',
    });

    res.status(200).json({
      success: true,
      message: 'If an account exists with this email, password reset instructions will be sent.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password using token
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!token || !password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Valid token and new password (min 6 characters) are required',
      });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select('+resetPasswordToken +resetPasswordExpires');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Password reset token is invalid or has expired',
      });
    }

    user.passwordHash = await User.hashPassword(password);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    if (!user.authProviders.includes('local')) {
      user.authProviders.push('local');
    }
    await user.save();

    await AuditLog.create({
      actor: user._id,
      actorEmail: user.email,
      action: 'PASSWORD_RESET_COMPLETED',
      ipAddress: req.ip || '',
      userAgent: req.get('User-Agent') || '',
    });

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  googleAuth,
  logout,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
};
