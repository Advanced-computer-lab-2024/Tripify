import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';

dotenv.config();

const app = express();

// Connect to the database before starting the server
connectDB().then(() => {
  app.listen(5000, () => {
    console.log('Server started at http://localhost:5000');
  });
}).catch(error => {
  console.error('Database connection failed. Server not started.', error);
  process.exit(1);
});
