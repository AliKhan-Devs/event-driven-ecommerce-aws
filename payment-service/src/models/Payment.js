import mongoose from "mongoose";

/**
 * Payment Schema
 * Stores payment details for each order
 */
const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["SUCCESS", "FAILED"],
      default: "SUCCESS",
    },
  },
  { timestamps: true }
);

export const Payment = mongoose.model("Payment", paymentSchema);