import jwt from 'jsonwebtoken';
import { dbQuery } from '../models/db-json-backup.js';

const JWT_SECRET = process.env.JWT_SECRET || 'service_marketplace_super_secret_jwt_key_2026';

export const requireAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required. Please log in first.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    // Fetch user and check block status
    const user = dbQuery.findById('users', decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'User session invalid. Please log in again.' });
    }

    if (user.is_blocked) {
      return res.status(403).json({ message: 'Account blocked. Contact administrator support.' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error('JWT auth verification failed:', error);
    return res.status(401).json({ message: 'Session expired or invalid. Please re-authenticate.' });
  }
};

export const requireRole = (roleId) => {
  return (req, res, next) => {
    if (!req.user || req.user.roleId !== Number(roleId)) {
      return res.status(403).json({ message: 'Access denied: Insufficient privileges.' });
    }
    next();
  };
};
