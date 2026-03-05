import mongoose from "mongoose";

/**
 * Inventory Schema
 * Stores product stock information
 */
const inventorySchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true,
      unique: true
    },
    stock: {
      type: Number,
      required: true
    }
  },
  { timestamps: true }
);

export const Inventory = mongoose.model("Inventory", inventorySchema);