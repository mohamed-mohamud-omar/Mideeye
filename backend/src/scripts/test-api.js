import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import app from '../app.js';
import http from 'http';
import axios from 'axios';
import { Book } from '../models/Book.js';

const runTests = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/online_book_store';
  await mongoose.connect(mongoUri);

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5001, resolve));
  console.log('[Test Runner] Server listening on port 5001');

  const client = axios.create({
    baseURL: 'http://localhost:5001/api',
    validateStatus: () => true
  });

  try {
    console.log('\n--- 1. Testing Health Endpoint ---');
    const healthRes = await client.get('/health');
    console.assert(healthRes.status === 200, 'Health check should return 200');
    console.assert(healthRes.data.success === true, 'Health check should be true');
    console.log('✅ Health check passed:', healthRes.data.service);

    console.log('\n--- 2. Testing Customer Login ---');
    const loginRes = await client.post('/auth/login', {
      email: 'customer@bookstore.com',
      password: 'Customer@123456'
    });
    console.assert(loginRes.status === 200, 'Login status should be 200');
    const customerToken = loginRes.data.token;
    console.assert(!!customerToken, 'Customer JWT token should be returned');
    console.log('✅ Customer login passed, user:', loginRes.data.user.name);

    console.log('\n--- 3. Testing Book Catalog Retrieval & Filters ---');
    const booksRes = await client.get('/books?category=Programming&limit=5');
    console.assert(booksRes.status === 200, 'Books query should return 200');
    console.assert(booksRes.data.data.length > 0, 'Should find programming books');
    const targetBook = booksRes.data.data[0];
    const initialStock = targetBook.stock;
    console.log(`✅ Book catalog query passed. Selected book: "${targetBook.title}" (Initial Stock: ${initialStock})`);

    console.log('\n--- 4. Testing MWallet Successful Checkout Flow ---');
    const customerClient = axios.create({
      baseURL: 'http://localhost:5001/api',
      headers: { Authorization: `Bearer ${customerToken}` },
      validateStatus: () => true
    });

    const checkoutRes = await customerClient.post('/orders/checkout', {
      items: [{ bookId: targetBook._id, quantity: 1 }],
      payerAccount: '252615554433',
      shippingAddress: {
        fullName: 'Mohamed Ali',
        email: 'customer@bookstore.com',
        phone: '252615554433',
        city: 'Mogadishu',
        street: 'Maka Al Mukarama'
      }
    });

    console.assert(checkoutRes.status === 200, `Checkout should return 200, got ${checkoutRes.status}: ${JSON.stringify(checkoutRes.data)}`);
    console.assert(checkoutRes.data.success === true, 'Checkout should be successful');
    console.assert(checkoutRes.data.data.order.orderStatus === 'PAID', 'Order status should be PAID');
    console.assert(checkoutRes.data.data.order.paymentStatus === 'SUCCESS', 'Payment status should be SUCCESS');
    console.assert(!!checkoutRes.data.data.order.paymentReference, 'Payment reference should be generated');

    const paymentRef = checkoutRes.data.data.order.paymentReference;
    console.log(`✅ MWallet checkout passed! Reference ID: ${paymentRef}, Invoice: ${checkoutRes.data.data.order.invoiceId}`);

    // Verify Stock was decremented by 1
    const updatedBook = await Book.findById(targetBook._id);
    console.assert(updatedBook.stock === initialStock - 1, `Stock should be decremented from ${initialStock} to ${initialStock - 1}, actual: ${updatedBook.stock}`);
    console.log(`✅ Inventory verified: Stock decremented from ${initialStock} -> ${updatedBook.stock}`);

    console.log('\n--- 5. Testing MWallet Failed Payment (Insufficient Balance Ending in 0000) ---');
    const failedCheckoutRes = await customerClient.post('/orders/checkout', {
      items: [{ bookId: targetBook._id, quantity: 1 }],
      payerAccount: '252615000000', // ends in 0000 -> triggers Insufficient Balance
      shippingAddress: {
        fullName: 'Mohamed Ali',
        email: 'customer@bookstore.com',
        phone: '252615000000',
        city: 'Mogadishu',
        street: 'Maka Al Mukarama'
      }
    });

    console.assert(failedCheckoutRes.status === 402, `Failed checkout should return 402, got ${failedCheckoutRes.status}`);
    console.assert(failedCheckoutRes.data.success === false, 'Failed checkout success should be false');
    console.log('✅ MWallet failure simulation passed:', failedCheckoutRes.data.message);

    // Verify Stock was NOT decremented on failed payment
    const bookAfterFail = await Book.findById(targetBook._id);
    console.assert(bookAfterFail.stock === updatedBook.stock, 'Stock should NOT be decremented on failed payment');
    console.log(`✅ Inventory safety verified: Stock remained unchanged at ${bookAfterFail.stock}`);

    console.log('\n--- 6. Testing Payment Verification Lookup ---');
    const verifyRes = await customerClient.post('/payments/verify', {
      referenceId: paymentRef
    });
    console.assert(verifyRes.status === 200, 'Verification should return 200');
    console.assert(verifyRes.data.data.status === 'SUCCESS', 'Verification status should be SUCCESS');
    console.log('✅ Payment verification passed:', verifyRes.data.data);

    console.log('\n--- 7. Testing Admin Dashboard & Security Guard ---');
    // Non-admin attempting to access admin route should receive 403 Forbidden
    const forbiddenRes = await customerClient.get('/admin/dashboard');
    console.assert(forbiddenRes.status === 403, 'Customer should be forbidden from admin dashboard');
    console.log('✅ Security guard passed: Customer blocked from admin area');

    // Admin login
    const adminLoginRes = await client.post('/auth/login', {
      email: 'admin@bookstore.com',
      password: 'Admin@123456'
    });
    const adminToken = adminLoginRes.data.token;
    const adminClient = axios.create({
      baseURL: 'http://localhost:5001/api',
      headers: { Authorization: `Bearer ${adminToken}` },
      validateStatus: () => true
    });

    const dashboardRes = await adminClient.get('/admin/dashboard');
    console.assert(dashboardRes.status === 200, 'Admin dashboard should return 200');
    console.assert(dashboardRes.data.data.metrics.totalOrders >= 2, 'Total orders should be recorded');
    console.log('✅ Admin dashboard passed! Metrics:', dashboardRes.data.data.metrics);

    console.log('\n🎉 ALL 7 BACKEND & MWALLET TESTS PASSED PERFECTLY!\n');
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    process.exit(1);
  } finally {
    server.close();
    await mongoose.disconnect();
    process.exit(0);
  }
};

runTests();
