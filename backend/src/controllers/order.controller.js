import { Order } from '../models/Order.js';
import { Book } from '../models/Book.js';
import { PaymentService } from '../services/payment.service.js';

export const checkoutWithMWallet = async (req, res, next) => {
  try {
    const { items, shippingAddress, payerAccount } = req.body;
    const userId = req.user._id;

    // 1. Validate incoming payload structure
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your cart is empty. Please add books before checking out.',
        errorCode: 'CART_EMPTY'
      });
    }

    if (!payerAccount) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your Mobile Wallet account number.',
        errorCode: 'WALLET_REQUIRED'
      });
    }

    const walletCheck = PaymentService.validateWalletAccount(payerAccount);
    if (!walletCheck.isValid) {
      return res.status(400).json({
        success: false,
        message: walletCheck.message,
        errorCode: 'INVALID_WALLET_ACCOUNT'
      });
    }

    if (
      !shippingAddress ||
      !shippingAddress.fullName ||
      !shippingAddress.email ||
      !shippingAddress.phone ||
      !shippingAddress.city ||
      !shippingAddress.street
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide complete delivery information.',
        errorCode: 'INCOMPLETE_SHIPPING'
      });
    }

    // 2. Fetch Books & Validate Real-time Stock + Calculate Verified Totals
    const bookIds = items.map((i) => i.bookId);
    const books = await Book.find({ _id: { $in: bookIds }, status: 'ACTIVE' });

    if (books.length !== items.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more selected books are no longer available.',
        errorCode: 'BOOK_UNAVAILABLE'
      });
    }

    const bookMap = new Map();
    books.forEach((b) => bookMap.set(b._id.toString(), b));

    const orderItems = [];
    let calculatedSubtotal = 0;

    for (const item of items) {
      const book = bookMap.get(item.bookId.toString());
      const quantity = parseInt(item.quantity, 10);

      if (!quantity || quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid quantity specified for "${book.title}".`,
          errorCode: 'INVALID_QUANTITY'
        });
      }

      // Strict stock validation
      if (book.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${book.title}". Only ${book.stock} left in stock.`,
          errorCode: 'INSUFFICIENT_STOCK',
          availableStock: book.stock,
          bookId: book._id
        });
      }

      // Calculate unit price based on active discount if any
      const unitPrice =
        book.discountPrice > 0 && book.discountPrice < book.price
          ? book.discountPrice
          : book.price;

      const itemSubtotal = Math.round(unitPrice * quantity * 100) / 100;
      calculatedSubtotal = Math.round((calculatedSubtotal + itemSubtotal) * 100) / 100;

      orderItems.push({
        bookId: book._id,
        title: book.title,
        author: book.author,
        coverImage: book.coverImage,
        price: unitPrice,
        quantity: quantity,
        subtotal: itemSubtotal
      });
    }

    // Delivery fee logic: Free delivery for orders over $50, otherwise $3.50
    const deliveryFee = calculatedSubtotal >= 50 ? 0.0 : 3.5;
    const discount = 0.0;
    const tax = 0.0;
    const calculatedTotal = Math.round(
      (calculatedSubtotal + deliveryFee - discount + tax) * 100
    ) / 100;

    // 3. Generate unique references
    const paymentReference = PaymentService.generateReferenceId();
    const invoiceId = PaymentService.generateInvoiceId();
    const requestId = PaymentService.generateRequestId();

    // 4. Create Initial Pending Order
    const order = await Order.create({
      userId,
      items: orderItems,
      subtotal: calculatedSubtotal,
      discount,
      deliveryFee,
      tax,
      total: calculatedTotal,
      shippingAddress: {
        fullName: shippingAddress.fullName.trim(),
        email: shippingAddress.email.trim().toLowerCase(),
        phone: shippingAddress.phone.trim(),
        city: shippingAddress.city.trim(),
        district: (shippingAddress.district || '').trim(),
        street: shippingAddress.street.trim(),
        zipCode: (shippingAddress.zipCode || '').trim(),
        notes: (shippingAddress.notes || '').trim()
      },
      paymentMethod: 'MWALLET_ACCOUNT',
      payerAccount: walletCheck.cleanAccount,
      paymentStatus: 'PENDING',
      orderStatus: 'PENDING_PAYMENT',
      paymentReference,
      requestId,
      invoiceId
    });

    // 5. Dispatch MWallet API_PURCHASE via Backend Payment Service
    const paymentResult = await PaymentService.processMWalletPurchase({
      orderId: order._id,
      userId,
      payerAccount: walletCheck.cleanAccount,
      amount: calculatedTotal,
      currency: 'USD',
      invoiceId,
      referenceId: paymentReference,
      description: `BOOKSTORE ORDER #${invoiceId}`
    });

    // 6. Handle Payment Outcome
    if (paymentResult.success && paymentResult.status === 'SUCCESS') {
      // Payment Successful: Update Order to PAID
      order.paymentStatus = 'SUCCESS';
      order.orderStatus = 'PAID';
      order.paidAt = new Date();
      await order.save();

      // Atomically decrement inventory for all purchased items
      for (const item of orderItems) {
        await Book.findByIdAndUpdate(item.bookId, {
          $inc: {
            stock: -item.quantity,
            totalSold: item.quantity
          }
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Payment completed and order placed successfully!',
        data: {
          order,
          invoice: {
            invoiceId: order.invoiceId,
            referenceId: order.paymentReference,
            total: order.total,
            subtotal: order.subtotal,
            deliveryFee: order.deliveryFee,
            paymentMethod: 'MWALLET_ACCOUNT',
            payerAccount: order.payerAccount,
            paidAt: order.paidAt,
            items: order.items,
            shippingAddress: order.shippingAddress
          }
        }
      });
    } else {
      // Payment Failed: Order remains unpaid, stock is NOT decremented
      order.paymentStatus = 'FAILED';
      order.failureReason = paymentResult.message;
      await order.save();

      return res.status(402).json({
        success: false,
        message: paymentResult.message || 'Payment was declined by MWallet.',
        errorCode: paymentResult.errorCode || 'PAYMENT_FAILED',
        data: {
          orderId: order._id,
          referenceId: order.paymentReference,
          invoiceId: order.invoiceId,
          failureReason: paymentResult.message
        }
      });
    }
  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).populate('userId', 'name email phone');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
        errorCode: 'ORDER_NOT_FOUND'
      });
    }

    // Customer can only view their own order unless Admin
    if (
      req.user.role !== 'ADMIN' &&
      order.userId._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this order.',
        errorCode: 'FORBIDDEN'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (
      req.user.role !== 'ADMIN' &&
      order.userId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (['SHIPPED', 'DELIVERED', 'CANCELLED'].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel an order that is ${order.orderStatus.toLowerCase()}`
      });
    }

    // Restore stock if it was a paid order
    if (order.paymentStatus === 'SUCCESS') {
      for (const item of order.items) {
        await Book.findByIdAndUpdate(item.bookId, {
          $inc: {
            stock: item.quantity,
            totalSold: -item.quantity
          }
        });
      }
    }

    order.orderStatus = 'CANCELLED';
    order.cancelledAt = new Date();
    await order.save();

    res.json({
      success: true,
      message: 'Order cancelled successfully and inventory restored',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// ADMIN: Get all orders with status/search filters
export const getAllOrders = async (req, res, next) => {
  try {
    const { status, paymentStatus, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status && status !== 'ALL') {
      query.orderStatus = status;
    }

    if (paymentStatus && paymentStatus !== 'ALL') {
      query.paymentStatus = paymentStatus;
    }

    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { invoiceId: new RegExp(s, 'i') },
        { paymentReference: new RegExp(s, 'i') },
        { 'shippingAddress.fullName': new RegExp(s, 'i') },
        { 'shippingAddress.email': new RegExp(s, 'i') },
        { payerAccount: new RegExp(s, 'i') }
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const totalOrders = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      data: orders,
      pagination: {
        totalOrders,
        totalPages: Math.ceil(totalOrders / limitNum),
        currentPage: pageNum,
        limit: limitNum
      }
    });
  } catch (error) {
    next(error);
  }
};

// ADMIN: Update order progression (PROCESSING -> READY -> SHIPPED -> DELIVERED)
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { orderStatus, notes } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Security rule: Admin must NOT manually mark an unpaid order as paid without an official provider reconciliation
    if (order.paymentStatus !== 'SUCCESS' && orderStatus === 'PAID') {
      return res.status(400).json({
        success: false,
        message:
          'Security restriction: Cannot manually mark an unpaid order as PAID without provider verification.',
        errorCode: 'UNAUTHORIZED_PAYMENT_OVERRIDE'
      });
    }

    // Handle cancellation by admin
    if (orderStatus === 'CANCELLED' && order.orderStatus !== 'CANCELLED') {
      if (order.paymentStatus === 'SUCCESS') {
        for (const item of order.items) {
          await Book.findByIdAndUpdate(item.bookId, {
            $inc: { stock: item.quantity, totalSold: -item.quantity }
          });
        }
      }
      order.cancelledAt = new Date();
    }

    if (orderStatus === 'DELIVERED') {
      order.deliveredAt = new Date();
    }

    order.orderStatus = orderStatus;
    if (notes) order.notes = notes;
    await order.save();

    res.json({
      success: true,
      message: `Order status updated to ${orderStatus}`,
      data: order
    });
  } catch (error) {
    next(error);
  }
};
