import {Inventory} from "../models/Inventory.js";
export const processInventory = async (orderData) => {
  console.log("📦 Processing Inventory for Order:", orderData.orderId);

  const { items } = orderData;

  for (const item of items) {
    const { productId, quantity } = item;

    const product = await Inventory.findOne({ productId });

    if (!product) {
      throw new Error(`Product ${productId} not found `);
    }

    if (product.stock < quantity) {
      throw new Error(`Insufficient stock for ${productId} `);
    }

    product.stock -= quantity;
    await product.save();

    console.log(
      ` Inventory Updated for ${productId}. Remaining stock: ${product.stock}`
    );
  }

  console.log(" Inventory processing completed");

  return true;
};

export const revertInventory = async (orderData) => {
  console.log("🔄 Reverting Inventory for Order:", orderData.orderId);
  const { items } = orderData;

  for (const item of items) {
    const { productId, quantity } = item;

    const product = await Inventory.findOne({ productId });

    if (!product) {
      throw new Error(`Product ${productId} not found `);
    }

    product.stock += quantity;
    await product.save();

    console.log(
      ` Inventory Updated for ${productId}. Remaining stock: ${product.stock}`
    );
  }

  console.log(" Inventory revert completed");

  return true;
};