import { createOrder } from "../services/order.service.js";

/**
 * HTTP Controller.
 * Responsible only for request/response handling.
 */
export const createOrderHandler = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ error: "Amount is required" });
    }

    const order = await createOrder(amount);

    return res.status(201).json({
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};