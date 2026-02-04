import { Kafka } from "kafkajs";

import { getKafkaConfig } from "./config";

export interface KafkaClientOptions {
  clientId: string;
  nodeEnv: "development" | "production";
  ssl?: boolean;
  retry?: {
    initialRetryTime?: number;
    retries?: number;
  };
}

export function createKafkaClient(options: KafkaClientOptions): Kafka {
  const kafkaConfig = getKafkaConfig(options.nodeEnv);

  return new Kafka({
    clientId: options.clientId,
    brokers: kafkaConfig.bootstrap,
    ssl: options.ssl ?? true,
    retry: {
      initialRetryTime: options.retry?.initialRetryTime ?? 100,
      retries: options.retry?.retries ?? 8,
    },
  });
}
