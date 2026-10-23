import {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from "@aws-sdk/client-sqs";
import { processPayment } from "../services/paymentProcessor.js";
import { revertPayment } from "../services/paymentRevert.js";

const sqs = new SQSClient({ region: process.env.AWS_REGION });

/**
 * Polls the payment SQS queue and routes each SNS notification by event type.
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
          // By default, SNS wraps the published event in its Message field.
          const notification = JSON.parse(message.Body);

          if (notification.Type !== "Notification" || typeof notification.Message !== "string") {
            throw new Error("Expected an SNS notification message");
          }

          const event = JSON.parse(notification.Message);

          switch (event.eventType) {
            case "ORDER_CREATED":
              await processPayment(event);
              break;
            case "INVENTORY_FAILED":
              await revertPayment(event.orderId);
              break;
            default:
              // This queue may receive other events from the shared SNS topic.
              console.log("Ignoring unsupported payment event:", event.eventType);
          }

          // Delete only after the event has been handled successfully or safely ignored.
          await sqs.send(
            new DeleteMessageCommand({
              QueueUrl: process.env.SQS_QUEUE_URL,
              ReceiptHandle: message.ReceiptHandle,
            })
          );

          console.log("🗑 Message Deleted");
        } catch (error) {
          console.error("Error processing payment event:", error.message);
          // Keep failed messages in SQS so they can be retried.
        }
      }
    } catch (error) {
      console.error("SQS Polling Error:", error);
    }
  }
};
