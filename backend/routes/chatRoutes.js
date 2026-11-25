const express = require('express');
const rateLimit = require('express-rate-limit');
const { chat } = require('../controllers/chatController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 6,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many chat requests. Please wait a minute and try again.',
  },
});

router.post('/', protect, authorize('user'), chatLimiter, chat);

module.exports = router;
