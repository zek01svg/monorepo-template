// Export all Kafka utilities
export * from "./client";
export * from "./config";
export * from "./consumer";
export * from "./manager";
export * from "./producer";
export * from "./types";

// Re-export kafkajs types for convenience
export type {
  Consumer,
  EachMessagePayload,
  Kafka,
  Message,
  Producer,
} from "kafkajs";

// Export our custom types
export type {
  TopicHandler,
  TopicHandlerRegistry,
  TypedMessageHandler,
  TypedMessagePayload,
} from "./consumer";

// Export specific types that are commonly used
export type { MessagePayload } from "./producer";
