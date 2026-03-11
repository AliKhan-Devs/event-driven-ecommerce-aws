import { Payment } from "../models/Payment.js";

/**
 * Simulates payment processing logic
 * In real-world this would call Stripe / JazzCash / etc
 */
export const processPayment = async (orderData) => {
  console.log("💳 Processing Payment for Order:", orderData.orderId);

  // Simulate random failure (for future SAGA testing)
  const isSuccess = Math.random() > 0.2;

  const payment = await Payment.create({
    orderId: orderData.orderId,
    amount: orderData.amount,
    status: isSuccess ? "SUCCESS" : "FAILED",
  });

  if (!isSuccess) {
    throw new Error("Payment Failed ");
  }

  console.log(" Payment Successful:", payment._id);

  return payment;
};

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