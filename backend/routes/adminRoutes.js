import express from 'express';
import {
  getAdminStats,
  getAllUsers,
  updateUserBlockState,
  deleteUser,
  getAllProviders,
  updateProviderStatus,
  getAllAdministrativeBookings
} from '../controllers/adminController.js';
import { requireAuth, requireRole } from './authMiddleware.js';

const router = express.Router();

router.get('/stats', requireAuth, requireRole(3), getAdminStats);
router.get('/users', requireAuth, requireRole(3), getAllUsers);
router.put('/users/:id/block', requireAuth, requireRole(3), updateUserBlockState);
router.delete('/users/:id', requireAuth, requireRole(3), deleteUser);

router.get('/providers', requireAuth, requireRole(3), getAllProviders);
router.put('/providers/:id/status', requireAuth, requireRole(3), updateProviderStatus);

router.get('/bookings', requireAuth, requireRole(3), getAllAdministrativeBookings);

export default router;
