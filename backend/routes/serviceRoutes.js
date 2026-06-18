import express from 'express';
import {
  getAllServices,
  getServiceDetail,
  getProviderDetail,
  createService,
  updateService,
  deleteService,
  getProviderServices,
  updateAvailability
} from '../controllers/serviceController.js';
import { requireAuth, requireRole } from './authMiddleware.js';

const router = express.Router();

router.get('/', getAllServices);
router.get('/provider/list', requireAuth, requireRole(2), getProviderServices);
router.get('/provider/:id', getProviderDetail);
router.get('/:id', getServiceDetail);

router.post('/', requireAuth, requireRole(2), createService);
router.put('/availability', requireAuth, requireRole(2), updateAvailability);
router.put('/:id', requireAuth, requireRole(2), updateService);
router.delete('/:id', requireAuth, requireRole(2), deleteService);

export default router;
