import mongoose from 'mongoose';

const orderItemSnapshotSchema = new mongoose.Schema(
  {
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true
    },
    title: {
      type: String,
      required: true
    },
    author: {
      type: String,
      default: ''
    },
    coverImage: {
      type: String,
      default: ''
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0
    }
  },
  { _id: false }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    city: { type: String, required: true },
    district: { type: String, default: '' },
    street: { type: String, required: true },
    zipCode: { type: String, default: '' },
    notes: { type: String, default: '' }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    items: {
      type: [orderItemSnapshotSchema],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'Order must contain at least one item'
      }
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    discount: {
      type: Number,
      default: 0,
      min: 0
    },
    deliveryFee: {
      type: Number,
      default: 0,
      min: 0
    },
    tax: {
      type: Number,
      default: 0,
      min: 0
    },
    total: {
      type: Number,
      required: true,
      min: 0
    },
    shippingAddress: {
      type: shippingAddressSchema,
      required: true
    },
    paymentMethod: {
      type: String,
      enum: ['MWALLET_ACCOUNT'],
      default: 'MWALLET_ACCOUNT'
    },
    payerAccount: {
      type: String,
      required: true,
      trim: true
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'CANCELLED'],
      default: 'PENDING',
      index: true
    },
    orderStatus: {
      type: String,
      enum: [
        'PENDING_PAYMENT',
        'PAID',
        'PROCESSING',
        'READY',
        'SHIPPED',
        'DELIVERED',
        'CANCELLED'
      ],
      default: 'PENDING_PAYMENT',
      index: true
    },
    paymentReference: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    requestId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    invoiceId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    paidAt: {
      type: Date
    },
    deliveredAt: {
      type: Date
    },
    cancelledAt: {
      type: Date
    },
    failureReason: {
      type: String,
      default: ''
    },
    notes: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

export const Order = mongoose.model('Order', orderSchema);
