import { Inventory } from "../models/Inventory.js";

/**
 * Handles stock deduction when order is placed
 */
export const processInventory = async (orderData) => {
  console.log("📦 Processing Inventory for Order:", orderData.orderId);

  const { productId, quantity } = orderData;

  const product = await Inventory.findOne({ productId });

  if (!product) {
    throw new Error("Product not found ❌");
  }

  if (product.stock < quantity) {
    throw new Error("Insufficient Stock ❌");
  }

  product.stock -= quantity;
  await product.save();

  console.log("✅ Inventory Updated. Remaining stock:", product.stock);

  return product;
};