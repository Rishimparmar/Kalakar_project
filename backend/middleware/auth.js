const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../config/db'); // Require database to log events and verify users

const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token missing' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      // Log failed authorization attempt (403 invalid token)
      db.run(`INSERT INTO activity_logs (admin_id, action, details) VALUES (NULL, 'INVALID_TOKEN_ATTEMPT', ?)`,
        [`Attempt to access route ${req.originalUrl} with invalid token. IP: ${req.ip}`]
      );
      return res.status(403).json({ message: 'Token is invalid or expired' });
    }
    req.user = user;
    next();
  });
};

const requireAdmin = (req, res, next) => {
  authenticateToken(req, res, () => {
    if (req.user && req.user.role === 'admin') {
      // Zero Trust: check the user's role directly in the database
      db.get(`SELECT u.role FROM users u JOIN admins a ON u.id = a.user_id WHERE u.id = ? AND u.role = 'admin'`, 
        [req.user.id], (err, row) => {
          if (err || !row) {
            db.run(`INSERT INTO activity_logs (admin_id, action, details) VALUES (NULL, 'PRIVILEGE_ESCALATION_ATTEMPT', ?)`,
              [`User ID ${req.user.id} tried to access admin route ${req.originalUrl} but is not active in DB. IP: ${req.ip}`]
            );
            return res.status(403).json({ message: 'Require active Admin authorization' });
          }
          next();
        }
      );
    } else {
      const userId = req.user ? req.user.id : 'anonymous';
      db.run(`INSERT INTO activity_logs (admin_id, action, details) VALUES (NULL, 'UNAUTHORIZED_ACCESS_ATTEMPT', ?)`,
        [`User ${userId} tried to access admin route ${req.originalUrl} without Admin role. IP: ${req.ip}`]
      );
      res.status(403).json({ message: 'Require Admin role' });
    }
  });
};

module.exports = {
  authenticateToken,
  requireAdmin,
  JWT_SECRET
};
