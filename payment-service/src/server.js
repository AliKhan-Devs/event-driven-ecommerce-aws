import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "./config/db.js";
import { startPaymentConsumer } from "./consumers/paymentConsumer.js";

/**
 * Bootstrap Payment Service
 */
const start = async () => {
  await connectDB();
  await startPaymentConsumer();
};

start();