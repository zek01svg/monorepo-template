import type { MessagePayload } from "@repo/kafka";
import { KafkaManager } from "@repo/kafka";

import { env } from "./env";

// Create a single Kafka manager instance for the analytics service
export const kafkaManager = new KafkaManager({
  clientId: "analytics-service",
  nodeEnv: env.NODE_ENV,
  ssl: true,
  retry: {
    initialRetryTime: 100,
    retries: 8,
  },
});

// Create producer and consumer instances
export const producer = kafkaManager.createProducer("analytics", {
  maxInFlightRequests: 1,
  idempotent: true,
  transactionTimeout: 30000,
});

export const consumer = kafkaManager.createConsumer("analytics", {
  groupId: "analytics-group",
  sessionTimeout: 30000,
  heartbeatInterval: 3000,
});

// Helper function to initialize producer
export async function initProducer() {
  await producer.connect();
}

// Helper function to initialize consumer
export async function initConsumer() {
  await consumer.connect();
}

// Helper function to cleanup connections
export async function disconnectKafka() {
  await kafkaManager.disconnectAll();
}

// Helper function to send messages
export async function sendMessage(
  topic: string,
  messages: MessagePayload[],
): Promise<void> {
  await producer.send(topic, messages);
}

// Helper function to subscribe to topics
export async function subscribeToTopic(topic: string) {
  await consumer.subscribe({ topic, fromBeginning: false });
}
