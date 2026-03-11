import { Payment } from "../models/Payment.js";
import { publishPayment } from "../publisher/publish.js";

/**
 * Simulates payment processing logic
 * In real-world this would call Stripe / JazzCash / etc
 */
export const processPayment = async (orderData) => {
  console.log("💳 Processing Payment for Order:", orderData.orderId);

  // Simulate random failure (for  SAGA testing)
  const isSuccess = Math.random() > 0.2;

  if (!isSuccess) {
  //  create event object and publish to SNS
    const event = {
      eventType: "PAYMENT_FAILED",
      orderId: orderData.orderId,
      amount: orderData.amount,
      items: orderData.items,
      createdAt: new Date(),
    };
    await publishPayment(event);
    return null; // Indicate failure
  }

// save payment record to database
  const payment = await Payment.create({
    orderId: orderData.orderId,
    amount: orderData.amount,
    status: "COMPLETED",
  });

  // create event object and publish to SNS
  const event = {
    eventType: "PAYMENT_SUCCESSFUL",
    orderId: orderData.orderId,
    amount: orderData.amount,
    items: orderData.items,
    createdAt: new Date(),
  };
  await publishPayment(event);
  return payment;
};

