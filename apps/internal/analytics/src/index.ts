// Import the topic registry to register types
import type { sessions } from "@repo/db-auth/schema";
import type { DatabaseEvent } from "@repo/kafka";

import { consumer, disconnectKafka, initConsumer, initProducer } from "./kafka";

async function main() {
  console.log("Starting Analytics Service...");

  try {
    // Initialize Kafka connections
    await initProducer();
    await initConsumer();

    // Register typed handlers for specific topics
    consumer.registerHandler<DatabaseEvent<typeof sessions.$inferSelect>>(
      "auth.public.sessions",
      (message) => {
        // Process analytics message here with type safety for sessions
        console.log("Sessions event:", message);

        // Add your typed analytics logic here
        // You now have full TypeScript intellisense for the sessions structure
      },
    );

    // You can register more handlers for different topics with different types
    // consumer.registerHandler<DatabaseEvent<SomeOtherType>>(
    //   "some.other.topic",
    //   async (message) => {
    //     // Handle different topic with different type
    //   }
    // );

    // Start consuming all registered topics
    await consumer.startWithHandlers();

    console.log("Analytics service is running...");
  } catch (error) {
    console.error("Failed to start analytics service:", error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("Received SIGTERM, shutting down gracefully...");
  void (async () => {
    await disconnectKafka();
    process.exit(0);
  })();
});

process.on("SIGINT", () => {
  console.log("Received SIGINT, shutting down gracefully...");
  void (async () => {
    await disconnectKafka();
    process.exit(0);
  })();
});

main().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
