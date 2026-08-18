import express from 'express';
import {
  getDashboardStats,
  getCustomersList
} from '../controllers/admin.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { adminOnly } from '../middleware/role.middleware.js';

const router = express.Router();

router.use(protect, adminOnly);
router.get('/dashboard', getDashboardStats);
router.get('/customers', getCustomersList);

export default router;
