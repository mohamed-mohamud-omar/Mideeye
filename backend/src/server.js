import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 5000;

// Connect Database and Start Server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`=================================================`);
      console.log(` 🚀 BookStore Backend API running on port ${PORT}`);
      console.log(` 🔒 MWallet Integration Mode: ${process.env.MWALLET_SANDBOX_MODE === 'true' ? 'SANDBOX' : 'LIVE'}`);
      console.log(` 🌐 Health Endpoint: http://localhost:${PORT}/api/health`);
      console.log(`=================================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
