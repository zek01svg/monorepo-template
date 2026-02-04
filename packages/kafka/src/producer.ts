import type { Kafka, Producer } from "kafkajs";

export interface ProducerOptions {
  maxInFlightRequests?: number;
  idempotent?: boolean;
  transactionTimeout?: number;
}

export interface MessagePayload {
  key?: string;
  value: string;
  partition?: number;
}

export class KafkaProducer {
  private producer: Producer;
  private connected = false;

  constructor(kafka: Kafka, options: ProducerOptions = {}) {
    this.producer = kafka.producer({
      maxInFlightRequests: options.maxInFlightRequests ?? 1,
      idempotent: options.idempotent ?? true,
      transactionTimeout: options.transactionTimeout ?? 30000,
    });
  }

  async connect(): Promise<void> {
    if (this.connected) return;

    try {
      await this.producer.connect();
      this.connected = true;
      console.log("Kafka producer connected successfully");
    } catch (error) {
      console.error("Failed to connect Kafka producer:", error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (!this.connected) return;

    try {
      await this.producer.disconnect();
      this.connected = false;
      console.log("Kafka producer disconnected");
    } catch (error) {
      console.error("Error disconnecting Kafka producer:", error);
      throw error;
    }
  }

  async send(topic: string, messages: MessagePayload[]): Promise<unknown> {
    if (!this.connected) {
      throw new Error("Producer is not connected");
    }

    try {
      const result = await this.producer.send({
        topic,
        messages,
      });
      console.log("Message sent successfully:", result);
      return result;
    } catch (error) {
      console.error("Failed to send message:", error);
      throw error;
    }
  }

  isConnected(): boolean {
    return this.connected;
  }
}

// Legacy function for backward compatibility
export async function sendMessage(
  producer: Producer,
  topic: string,
  messages: MessagePayload[],
): Promise<unknown> {
  try {
    const result = await producer.send({
      topic,
      messages,
    });
    console.log("Message sent successfully:", result);
    return result;
  } catch (error) {
    console.error("Failed to send message:", error);
    throw error;
  }
}
