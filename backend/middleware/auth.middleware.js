import jwt from 'jsonwebtoken';
import BaseUser from '../models/baseUser.model.js';

// Protect middleware to verify JWT and check user existence
export const protect = async (req, res, next) => {
  let token;

  // Get token from headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'You are not logged in' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists
    const currentUser = await BaseUser.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({ message: 'User no longer exists' });
    }

    // Attach user to request object
    req.user = currentUser;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token verification failed' });
  }
};

// RestrictTo middleware for role-based access control
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'You do not have permission to perform this action'
      });
    }
    next();
  };
};
