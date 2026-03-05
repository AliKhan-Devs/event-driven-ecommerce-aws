import { PublishCommand } from "@aws-sdk/client-sns";
import { v4 as uuidv4 } from "uuid";

import { Order } from "../models/order.model.js";
import { snsClient } from "../config/aws.js";

/**
 * Business logic layer.
 * Handles:
 * - Order persistence
 * - Event publishing to SNS
 */
export const createOrder = async (data) => {
  const orderId = uuidv4();
  const { amount, items } = data;

  // Save order locally
  const order = await Order.create({
    orderId,
    amount,
    status: "PENDING",
    items
  });

  // Create domain event
  const event = {
    eventType: "ORDER_CREATED",
    orderId,
    amount,
    items,
    createdAt: new Date(),
  };

  // Publish event to SNS
  await snsClient.send(
    new PublishCommand({
      TopicArn: process.env.SNS_TOPIC_ARN,
      Message: JSON.stringify(event),
    })
  );

  return order;
};