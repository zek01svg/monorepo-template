// Analytics service types
export interface AnalyticsEvent {
  event: string;
  timestamp: number;
  userId?: string;
  metadata?: Record<string, unknown>;
}

export interface KafkaMessage {
  topic: string;
  partition: number;
  offset: string;
  key?: string;
  value: string;
}
