// revert payment logic for SAGA compensation
export const revertPayment = async (orderId) => {
  console.log("🔄 Reverting Payment for Order:", orderId);
  const payment = await Payment.findOne({ orderId });

  if (payment) {
    payment.status = "FAILED";
    await payment.save();
  }
  console.log(" Payment Reverted for Order:", orderId);

  return true;
};