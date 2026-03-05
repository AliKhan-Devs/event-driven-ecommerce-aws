import mongoose from "mongoose";

/**
 * Connect to MongoDB
 */
export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(" Payment Service DB Connected");
  } catch (error) {
    console.error(" DB Connection Failed:", error);
    process.exit(1);
  }
};