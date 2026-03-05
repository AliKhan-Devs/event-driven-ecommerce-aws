import dotenv from "dotenv";

dotenv.config();

import app from "./app.js";
import { connectDB } from "./config/db.config.js";

const PORT = process.env.PORT || 4000;

/**
 * Bootstrap function.
 * Connects DB then starts server.
 */
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 Order Service running on port ${PORT}`);
  });
};

startServer();