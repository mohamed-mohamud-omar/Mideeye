import { Payment } from '../models/Payment.js';
import { PaymentService } from '../services/payment.service.js';

export const verifyPayment = async (req, res, next) => {
  try {
    const { referenceId } = req.body;

    if (!referenceId) {
      return res.status(400).json({
        success: false,
        message: 'Payment referenceId is required',
        errorCode: 'MISSING_REFERENCE'
      });
    }

    const verification = await PaymentService.verifyPayment(referenceId);

    if (!verification.found) {
      return res.status(404).json({
        success: false,
        message: 'Payment transaction reference not found',
        errorCode: 'PAYMENT_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: verification
    });
  } catch (error) {
    next(error);
  }
};

export const getPaymentByReference = async (req, res, next) => {
  try {
    const { referenceId } = req.params;
    const payment = await Payment.findOne({ referenceId }).populate('orderId');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found'
      });
    }

    // Security check: non-admins can only inspect their own payment records
    if (
      req.user.role !== 'ADMIN' &&
      payment.userId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    next(error);
  }
};

// ADMIN: Get all payment transactions log with search/filter
export const getAllPayments = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status && status !== 'ALL') {
      query.status = status;
    }

    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { referenceId: new RegExp(s, 'i') },
        { invoiceId: new RegExp(s, 'i') },
        { requestId: new RegExp(s, 'i') },
        { payerAccount: new RegExp(s, 'i') }
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const total = await Payment.countDocuments(query);
    const payments = await Payment.find(query)
      .populate('userId', 'name email phone')
      .populate('orderId', 'orderStatus total')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      data: payments,
      pagination: {
        total,
        totalPages: Math.ceil(total / limitNum),
        currentPage: pageNum,
        limit: limitNum
      }
    });
  } catch (error) {
    next(error);
  }
};
