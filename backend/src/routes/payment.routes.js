import express from 'express';
import {
  verifyPayment,
  getPaymentByReference,
  getAllPayments
} from '../controllers/payment.controller.js';
import { checkoutWithMWallet } from '../controllers/order.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { adminOnly } from '../middleware/role.middleware.js';

const router = express.Router();

// Direct payment creation endpoint matching spec
router.post('/create', protect, checkoutWithMWallet);

// Transaction verification endpoint
router.post('/verify', protect, verifyPayment);

// Fetch payment by referenceId
router.get('/:referenceId', protect, getPaymentByReference);

// Admin-only payment audit trail
router.get('/', protect, adminOnly, getAllPayments);

export default router;
