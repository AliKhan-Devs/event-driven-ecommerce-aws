import {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from "@aws-sdk/client-sqs";

import { processInventory } from "../services/inventoryProcessor.js";

const sqs = new SQSClient({ region: process.env.AWS_REGION });

/**
 * Continuously polls Inventory Queue
 */
export const startInventoryConsumer = async () => {
  console.log("👂 Inventory Service Listening to SQS...");

  while (true) {
    try {
      const command = new ReceiveMessageCommand({
        QueueUrl: process.env.SQS_QUEUE_URL,
        MaxNumberOfMessages: 1,
        WaitTimeSeconds: 10,
      });

      const response = await sqs.send(command);

      if (!response.Messages) continue;

      for (const message of response.Messages) {
        try {
          const body = JSON.parse(message.Body);
          const orderData = JSON.parse(body.Message);
        
          await processInventory(orderData);

          await sqs.send(
            new DeleteMessageCommand({
              QueueUrl: process.env.SQS_QUEUE_URL,
              ReceiptHandle: message.ReceiptHandle,
            })
          );

          console.log("🗑 Inventory Message Deleted");
        } catch (error) {
          console.error(" Inventory Processing Failed:", error.message);
          // Do not delete → message retries
        }
      }
    } catch (error) {
      console.error(" SQS Polling Error:", error);
    }
  }
};