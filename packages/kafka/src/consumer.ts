import type { Consumer, EachMessagePayload, Kafka } from "kafkajs";

export interface ConsumerOptions {
  groupId: string;
  sessionTimeout?: number;
  heartbeatInterval?: number;
}

export interface SubscribeOptions {
  topic: string;
  fromBeginning?: boolean;
}

export interface TypedMessagePayload<T> {
  topic: string;
  partition: number;
  message: {
    offset: string;
    key: string | null;
    value: T;
    rawValue: string | null;
  };
}

export type MessageHandler = (payload: EachMessagePayload) => Promise<void>;
export type TypedMessageHandler<T> = (
  payload: TypedMessagePayload<T>,
) => Promise<void>;

// Topic registry types
export type TopicHandler<T = unknown> = (message: T) => Promise<void> | void;

export type TopicHandlerRegistry = Record<string, TopicHandler>;

function parseMessageValue<T>(value: Buffer | null): T {
  if (!value) return null as T;

  const stringValue = value.toString();

  try {
    // Parse JSON and let TypeScript infer the type
    const parsed: T = JSON.parse(stringValue) as T;
    return parsed;
  } catch {
    // If JSON parsing fails, return the string value
    return stringValue as T;
  }
}

export class KafkaConsumer {
  private consumer: Consumer;
  private connected = false;
  private topicHandlers: TopicHandlerRegistry = {};
  private isRunningWithHandlers = false;

  constructor(kafka: Kafka, options: ConsumerOptions) {
    this.consumer = kafka.consumer({
      groupId: options.groupId,
      sessionTimeout: options.sessionTimeout ?? 30000,
      heartbeatInterval: options.heartbeatInterval ?? 3000,
    });
  }

  async connect(): Promise<void> {
    if (this.connected) return;

    try {
      await this.consumer.connect();
      this.connected = true;
      console.log("Kafka consumer connected successfully");
    } catch (error) {
      console.error("Failed to connect Kafka consumer:", error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (!this.connected) return;

    try {
      await this.consumer.disconnect();
      this.connected = false;
      console.log("Kafka consumer disconnected");
    } catch (error) {
      console.error("Error disconnecting Kafka consumer:", error);
      throw error;
    }
  }

  async subscribe(options: SubscribeOptions): Promise<void> {
    if (!this.connected) {
      throw new Error("Consumer is not connected");
    }

    try {
      await this.consumer.subscribe({
        topic: options.topic,
        fromBeginning: options.fromBeginning ?? false,
      });
      console.log(`Subscribed to topic: ${options.topic}`);
    } catch (error) {
      console.error(`Failed to subscribe to topic ${options.topic}:`, error);
      throw error;
    }
  }

  async run(messageHandler: MessageHandler): Promise<void> {
    if (!this.connected) {
      throw new Error("Consumer is not connected");
    }

    try {
      await this.consumer.run({
        eachMessage: messageHandler,
      });
    } catch (error) {
      console.error("Error running consumer:", error);
      throw error;
    }
  }

  async runTyped<T>(messageHandler: TypedMessageHandler<T>): Promise<void> {
    if (!this.connected) {
      throw new Error("Consumer is not connected");
    }

    try {
      await this.consumer.run({
        eachMessage: async (payload: EachMessagePayload) => {
          const typedPayload: TypedMessagePayload<T> = {
            topic: payload.topic,
            partition: payload.partition,
            message: {
              offset: payload.message.offset,
              key: payload.message.key?.toString() ?? null,
              value: parseMessageValue<T>(payload.message.value),
              rawValue: payload.message.value?.toString() ?? null,
            },
          };

          await messageHandler(typedPayload);
        },
      });
    } catch (error) {
      console.error("Error running typed consumer:", error);
      throw error;
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  // Topic registry methods

  /**
   * Register a typed handler for a specific topic
   * @param topic - The Kafka topic name
   * @param handler - Type-safe handler function for the topic
   */
  registerHandler<T>(topic: string, handler: TopicHandler<T>): void {
    this.topicHandlers[topic] = handler as TopicHandler;
  }

  /**
   * Unregister a handler for a specific topic
   * @param topic - The Kafka topic name
   */
  unregisterHandler(topic: string): void {
    delete this.topicHandlers[topic];
  }

  /**
   * Get all registered topics
   * @returns Array of topic names
   */
  getRegisteredTopics(): string[] {
    return Object.keys(this.topicHandlers);
  }

  /**
   * Check if a topic has a registered handler
   * @param topic - The Kafka topic name
   * @returns true if handler is registered
   */
  hasHandler(topic: string): boolean {
    return topic in this.topicHandlers;
  }

  /**
   * Clear all registered handlers
   */
  clearHandlers(): void {
    this.topicHandlers = {};
  }

  /**
   * Subscribe to all registered topics and start consuming messages
   * Each message will be routed to its registered handler with type safety
   */
  async startWithHandlers(): Promise<void> {
    if (this.isRunningWithHandlers) {
      throw new Error("Consumer is already running with handlers");
    }

    const topics = this.getRegisteredTopics();

    if (topics.length === 0) {
      throw new Error(
        "No topic handlers registered. Register handlers before starting.",
      );
    }

    if (!this.connected) {
      throw new Error(
        "Consumer is not connected. Connect the consumer before starting.",
      );
    }

    // Subscribe to all registered topics
    for (const topic of topics) {
      await this.subscribe({ topic, fromBeginning: false });
    }

    // Start consuming with routing to appropriate handlers
    await this.run(async (payload: EachMessagePayload) => {
      await this.routeMessage(payload);
    });

    this.isRunningWithHandlers = true;
  }

  /**
   * Route an incoming message to its registered handler
   * @param payload - The Kafka message payload
   */
  private async routeMessage(payload: EachMessagePayload): Promise<void> {
    const { topic, message } = payload;
    const handler = this.topicHandlers[topic];

    if (!handler) {
      console.warn(`No handler registered for topic: ${topic}`);
      return;
    }

    if (!message.value) {
      console.warn(`Received empty message for topic: ${topic}`);
      return;
    }

    try {
      const parsedValue: unknown = this.parseMessageValue(message.value);
      await handler(parsedValue);
    } catch (error) {
      console.error(`Error processing message from topic ${topic}:`, error);
      // Re-throw to trigger Kafka's retry mechanism
      throw error;
    }
  }

  /**
   * Parse message value from Buffer to JavaScript object
   * @param value - The raw message value
   * @returns Parsed message value
   */
  private parseMessageValue(value: Buffer): unknown {
    try {
      const stringValue = value.toString();
      return JSON.parse(stringValue);
    } catch (error) {
      console.error("Failed to parse message value as JSON:", error);
      // Return the raw string if JSON parsing fails
      return value.toString();
    }
  }

  /**
   * Check if the consumer is currently running with handlers
   * @returns true if running with handlers
   */
  isRunningHandlers(): boolean {
    return this.isRunningWithHandlers;
  }
}

// Legacy function for backward compatibility
export async function subscribeToTopic(
  consumer: Consumer,
  topic: string,
): Promise<void> {
  try {
    await consumer.subscribe({ topic, fromBeginning: false });
    console.log(`Subscribed to topic: ${topic}`);
  } catch (error) {
    console.error(`Failed to subscribe to topic ${topic}:`, error);
    throw error;
  }
}
