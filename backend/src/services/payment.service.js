import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { Payment } from '../models/Payment.js';

export class PaymentService {
  /**
   * Generate a unique standardized reference ID
   * Example: BOOKPAY-20260814-A1B2C3D4
   */
  static generateReferenceId() {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomPart = uuidv4().replace(/-/g, '').substring(0, 8).toUpperCase();
    return `BOOKPAY-${dateStr}-${randomPart}`;
  }

  /**
   * Generate a unique Invoice ID
   * Example: INV-20260814-99881
   */
  static generateInvoiceId() {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomPart = Math.floor(10000 + Math.random() * 90000);
    return `INV-${dateStr}-${randomPart}`;
  }

  /**
   * Generate unique Request ID
   */
  static generateRequestId() {
    return `REQ-${Date.now()}-${uuidv4().substring(0, 6)}`;
  }

  /**
   * Validate mobile wallet account format
   * Supports Somali MWallet numbers (e.g. 25261XXXXXXX, 2526XXXXXXXX, 061XXXXXXX, or 9-12 digit standard wallet accounts)
   */
  static validateWalletAccount(accountNo) {
    if (!accountNo || typeof accountNo !== 'string') {
      return { isValid: false, message: 'Wallet account number is required' };
    }
    const cleanAccount = accountNo.trim().replace(/\s+/g, '');
    const regex = /^(252\d{7,9}|06\d{7,8}|6\d{7,8}|\+?252\d{7,9}|\d{9,12})$/;
    if (!regex.test(cleanAccount)) {
      return {
        isValid: false,
        message: 'Invalid mobile wallet account number format. Example: 252615000000'
      };
    }
    return { isValid: true, cleanAccount };
  }

  /**
   * Execute MWallet API_PURCHASE transaction
   */
  static async processMWalletPurchase({
    orderId,
    userId,
    payerAccount,
    amount,
    currency = 'USD',
    invoiceId,
    referenceId,
    description = 'BOOK PURCHASE'
  }) {
    const accountCheck = this.validateWalletAccount(payerAccount);
    if (!accountCheck.isValid) {
      throw new Error(accountCheck.message);
    }

    const cleanPayerAccount = accountCheck.cleanAccount;
    const requestId = this.generateRequestId();
    const timestamp = new Date().toISOString();

    const merchantUid = process.env.MWALLET_MERCHANT_UID || 'MERCHANT-DEFAULT';
    const apiUserId = process.env.MWALLET_API_USER_ID || 'API-USER-DEFAULT';
    const apiKey = process.env.MWALLET_API_KEY || 'API-KEY-DEFAULT';
    const apiUrl = process.env.MWALLET_API_URL || 'https://api.mwallet.example.com/payment/purchase';
    const isSandbox = process.env.MWALLET_SANDBOX_MODE === 'true' || apiUrl.includes('example.com');

    // Official MWallet API Request Payload as defined in specification
    const payload = {
      schemaVersion: '1.0',
      requestId: requestId,
      timestamp: timestamp,
      channelName: 'WEB',
      serviceName: 'API_PURCHASE',
      serviceParams: {
        merchantUid: merchantUid,
        apiUserId: apiUserId,
        apiKey: apiKey,
        paymentMethod: 'MWALLET_ACCOUNT',
        payerInfo: {
          accountNo: cleanPayerAccount
        },
        transactionInfo: {
          referenceId: referenceId,
          invoiceId: invoiceId,
          amount: parseFloat(Number(amount).toFixed(2)),
          currency: currency,
          description: description
        }
      }
    };

    // Initialize Payment log entry in Database as PENDING
    const paymentRecord = await Payment.create({
      orderId,
      userId,
      referenceId,
      requestId,
      invoiceId,
      amount: parseFloat(Number(amount).toFixed(2)),
      currency,
      paymentMethod: 'MWALLET_ACCOUNT',
      payerAccount: cleanPayerAccount,
      status: 'PENDING'
    });

    try {
      let responseData;

      // Handle Sandbox / Live Gateway execution
      if (isSandbox) {
        // High-fidelity sandbox provider engine adhering to live MWallet status conventions
        responseData = await this.simulateSandboxProviderResponse({
          payerAccount: cleanPayerAccount,
          amount,
          referenceId,
          invoiceId,
          requestId
        });
      } else {
        // Live backend-to-provider HTTPS call
        const response = await axios.post(apiUrl, payload, {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-Timestamp': timestamp
          },
          timeout: 20000
        });
        responseData = response.data;
      }

      // Check MWallet provider response codes
      // Standard MWallet responses: responseCode '200' / '0000' / 'SUCCESS' or status: 'SUCCESS' / 'PAID'
      const isSuccess =
        responseData &&
        (responseData.responseCode === '200' ||
          responseData.responseCode === '0000' ||
          responseData.responseCode === 'SUCCESS' ||
          responseData.status === 'SUCCESS' ||
          responseData.status === 'PAID' ||
          responseData.resultCode === '0');

      if (isSuccess) {
        paymentRecord.status = 'SUCCESS';
        paymentRecord.providerResponse = responseData;
        await paymentRecord.save();

        return {
          success: true,
          status: 'SUCCESS',
          paymentRecord,
          transactionId: responseData.transactionId || referenceId,
          message: responseData.responseMessage || 'Payment approved and completed successfully'
        };
      } else {
        const failureReason =
          responseData?.responseMessage ||
          responseData?.message ||
          responseData?.error ||
          'Payment declined by MWallet provider';

        paymentRecord.status = 'FAILED';
        paymentRecord.providerResponse = responseData;
        paymentRecord.failureReason = failureReason;
        await paymentRecord.save();

        return {
          success: false,
          status: 'FAILED',
          paymentRecord,
          message: failureReason,
          errorCode: responseData?.responseCode || 'PAYMENT_REJECTED'
        };
      }
    } catch (err) {
      console.error('[MWallet Payment Error]:', err.message);

      const errorMessage =
        err.response?.data?.responseMessage ||
        err.response?.data?.message ||
        err.message ||
        'MWallet service communication failure';

      paymentRecord.status = 'FAILED';
      paymentRecord.providerResponse = err.response?.data || { error: err.message };
      paymentRecord.failureReason = errorMessage;
      await paymentRecord.save();

      return {
        success: false,
        status: 'FAILED',
        paymentRecord,
        message: errorMessage,
        errorCode: 'GATEWAY_ERROR'
      };
    }
  }

  /**
   * Verify an existing MWallet transaction status
   */
  static async verifyPayment(referenceId) {
    const payment = await Payment.findOne({ referenceId });
    if (!payment) {
      return {
        found: false,
        message: 'Payment reference not found'
      };
    }

    return {
      found: true,
      status: payment.status,
      referenceId: payment.referenceId,
      invoiceId: payment.invoiceId,
      amount: payment.amount,
      currency: payment.currency,
      payerAccount: payment.payerAccount,
      createdAt: payment.createdAt,
      failureReason: payment.failureReason
    };
  }

  /**
   * Sandbox simulation engine for local & staging tests
   * Allows predictable testing of various gateway conditions:
   * - Ending in '0000' -> Insufficient balance error
   * - Ending in '1111' -> Timeout error
   * - Ending in '9999' -> Invalid account error
   * - Any other valid number -> 100% Success
   */
  static async simulateSandboxProviderResponse({
    payerAccount,
    amount,
    referenceId,
    invoiceId,
    requestId
  }) {
    // Artificial slight network latency (300ms) for realistic UX
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (payerAccount.endsWith('0000')) {
      return {
        schemaVersion: '1.0',
        requestId,
        timestamp: new Date().toISOString(),
        responseCode: '4001',
        responseMessage: 'Insufficient funds in customer mobile wallet account',
        status: 'FAILED',
        resultCode: 'INSUFFICIENT_BALANCE'
      };
    }

    if (payerAccount.endsWith('9999')) {
      return {
        schemaVersion: '1.0',
        requestId,
        timestamp: new Date().toISOString(),
        responseCode: '4004',
        responseMessage: 'Customer wallet account not found or suspended',
        status: 'FAILED',
        resultCode: 'INVALID_ACCOUNT'
      };
    }

    if (payerAccount.endsWith('1111')) {
      return {
        schemaVersion: '1.0',
        requestId,
        timestamp: new Date().toISOString(),
        responseCode: '5004',
        responseMessage: 'MWallet provider request timed out during authentication',
        status: 'FAILED',
        resultCode: 'PROVIDER_TIMEOUT'
      };
    }

    // Default Approved Transaction
    return {
      schemaVersion: '1.0',
      requestId,
      timestamp: new Date().toISOString(),
      responseCode: '200',
      responseMessage: 'Transaction approved and settled successfully',
      status: 'SUCCESS',
      resultCode: '0',
      transactionId: `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      referenceId,
      invoiceId,
      amount,
      currency: 'USD'
    };
  }
}
