import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "./config/db.js";
import { startInventoryConsumer } from "./consumers/inventoryConsumer.js";

/**
 * Bootstrap Inventory Service
 */
const start = async () => {
  await connectDB();
  await startInventoryConsumer();
};

start();