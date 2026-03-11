export const inventoryRevert = async (orderData) => {
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