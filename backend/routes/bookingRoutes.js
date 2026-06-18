import express from 'express';
import {
  createBooking,
  getCustomerBookings,
  getProviderBookings,
  updateBookingStatus,
  cancelBooking,
  submitPayment,
  submitReview,
  getUserNotifications,
  markNotificationsAsRead
} from '../controllers/bookingController.js';
import { requireAuth, requireRole } from './authMiddleware.js';

const router = express.Router();

router.post('/', requireAuth, createBooking);
router.get('/customer', requireAuth, requireRole(1), getCustomerBookings);
router.get('/provider', requireAuth, requireRole(2), getProviderBookings);

router.put('/:id/status', requireAuth, requireRole(2), updateBookingStatus);
router.put('/:id/cancel', requireAuth, requireRole(1), cancelBooking);

router.post('/payment', requireAuth, requireRole(1), submitPayment);
router.post('/review', requireAuth, requireRole(1), submitReview);

router.get('/notifications', requireAuth, getUserNotifications);
router.put('/notifications/read', requireAuth, markNotificationsAsRead);

export default router;
