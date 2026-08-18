import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    referenceId: {
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
      index: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD'
    },
    paymentMethod: {
      type: String,
      default: 'MWALLET_ACCOUNT'
    },
    payerAccount: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'CANCELLED'],
      default: 'PENDING',
      index: true
    },
    providerResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    failureReason: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

export const Payment = mongoose.model('Payment', paymentSchema);
