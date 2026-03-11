import {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from "@aws-sdk/client-sqs";
import { revertOrder } from "../services/order.service";


const sqs = new SQSClient({ region: process.env.AWS_REGION });

/**
 * Polls SQS Queue continuously
 */
export const startOrderConsumer = async () => {
  console.log("Order Service Listening to SQS...");

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

            await revertOrder(orderData.orderId);

          // Delete message after success
          await sqs.send(
            new DeleteMessageCommand({
              QueueUrl: process.env.SQS_QUEUE_URL,
              ReceiptHandle: message.ReceiptHandle,
            })
          );

          console.log("🗑 Message Deleted");
        } catch (error) {
          console.error(" Error processing Order delete:", error.message);
          // Do NOT delete message (will retry)
        }
      }
    } catch (error) {
      console.error(" SQS Polling Error:", error);
    }
  }
};