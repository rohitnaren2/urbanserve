import express from 'express';
import {
  registerCustomer,
  registerProvider,
  login,
  getProfile,
  updateProfile,
  updateProviderProfile
} from '../controllers/authController.js';
import { requireAuth, requireRole } from './authMiddleware.js';

const router = express.Router();

router.post('/register/customer', registerCustomer);
router.post('/register/provider', registerProvider);
router.post('/login', login);

router.get('/profile', requireAuth, getProfile);
router.put('/profile', requireAuth, updateProfile);
router.put('/provider-profile', requireAuth, requireRole(2), updateProviderProfile);

export default router;
