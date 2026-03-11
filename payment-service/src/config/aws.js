import { SNSClient } from "@aws-sdk/client-sns";

/**
 * Centralized SNS client configuration.
 * Keeps AWS logic separate from business logic.
 */
export const snsClient = new SNSClient({
  region: process.env.AWS_REGION,
  
});