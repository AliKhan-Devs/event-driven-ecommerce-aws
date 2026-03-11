import {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from "@aws-sdk/client-sqs";
import { processPayment, revertPayment } from "../services/paymentProcessor.js";

const sqs = new SQSClient({ region: process.env.AWS_REGION });

/**
 * Polls SQS Queue continuously
 */
export const startPaymentConsumer = async () => {
  console.log("👂 Payment Service Listening to SQS...");

  while (true) {
    try {
      const command = new ReceiveMessageCommand({
        QueueUrl: process.env.SQS_QUEUE_URL,
        MaxNumberOfMessages: 1,
        WaitTimeSeconds: 10, // Long polling
      });

      const response = await sqs.send(command);

      if (!response.Messages) continue;

      for (const message of response.Messages) {
        try {
          // SNS wraps original message inside Message field
          const body = JSON.parse(message.Body);
          const orderData = JSON.parse(body.Message);

          // if event type is order_created, process payment and if event type is inventory failed, revert payment
          if (body.Type === "Notification") {
            if (orderData.eventType === "ORDER_CREATED") {
              await processPayment(orderData);
            } else if (orderData.eventType === "INVENTORY_FAILED") {
              await revertPayment(orderData);
            }
          }
          await processPayment(orderData);

          // Delete message after success
          await sqs.send(
            new DeleteMessageCommand({
              QueueUrl: process.env.SQS_QUEUE_URL,
              ReceiptHandle: message.ReceiptHandle,
            })
          );

          console.log("🗑 Message Deleted");
        } catch (error) {
          console.error(" Error processing payment:", error.message);
          // Do NOT delete message (will retry)
        }
      }
    } catch (error) {
      console.error(" SQS Polling Error:", error);
    }
  }
};