import mongoose from "mongoose";

/**
 * Order schema definition.
 * Represents domain entity for this service.
 */
const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    items: [
  {
    productId: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true
    }
  }
],
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "COMPLETED", "FAILED"],
      default: "PENDING",
    },
  },
  { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);