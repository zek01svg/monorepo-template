import type { Kafka } from "kafkajs";

import type { KafkaClientOptions } from "./client";
import type { ConsumerOptions } from "./consumer";
import type { ProducerOptions } from "./producer";
import { createKafkaClient } from "./client";
import { KafkaConsumer } from "./consumer";
import { KafkaProducer } from "./producer";

export class KafkaManager {
  private kafka: Kafka;
  private producers = new Map<string, KafkaProducer>();
  private consumers = new Map<string, KafkaConsumer>();

  constructor(options: KafkaClientOptions) {
    this.kafka = createKafkaClient(options);
  }

  createProducer(name: string, options: ProducerOptions = {}): KafkaProducer {
    const existing = this.producers.get(name);
    if (existing) {
      return existing;
    }

    const producer = new KafkaProducer(this.kafka, options);
    this.producers.set(name, producer);
    return producer;
  }

  createConsumer(name: string, options: ConsumerOptions): KafkaConsumer {
    const existing = this.consumers.get(name);
    if (existing) {
      return existing;
    }

    const consumer = new KafkaConsumer(this.kafka, options);
    this.consumers.set(name, consumer);
    return consumer;
  }

  async disconnectAll(): Promise<void> {
    const promises: Promise<void>[] = [];

    // Disconnect all producers
    for (const producer of this.producers.values()) {
      if (producer.isConnected()) {
        promises.push(producer.disconnect());
      }
    }

    // Disconnect all consumers
    for (const consumer of this.consumers.values()) {
      if (consumer.isConnected()) {
        promises.push(consumer.disconnect());
      }
    }

    await Promise.all(promises);

    this.producers.clear();
    this.consumers.clear();
  }

  getProducer(name: string): KafkaProducer | undefined {
    return this.producers.get(name);
  }

  getConsumer(name: string): KafkaConsumer | undefined {
    return this.consumers.get(name);
  }

  getKafkaClient(): Kafka {
    return this.kafka;
  }
}
