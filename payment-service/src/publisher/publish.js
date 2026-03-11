import { PublishCommand } from "@aws-sdk/client-sns";
import { snsClient } from "../config/aws.js";

/**
 * Business logic layer.
 * Handles:
 * - Order persistence
 * - Event publishing to SNS
 */
export const publishPayment = async (event) => {
  

  // Publish event to SNS
  await snsClient.send(
    new PublishCommand({
      TopicArn: process.env.SNS_TOPIC_ARN,
      Message: JSON.stringify(event),
      MessageAttributes: {
        eventType: {
          DataType: "String",
          StringValue: event.eventType,
        },
      },
    })
  );


};