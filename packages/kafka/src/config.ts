export const LOCAL_KAFKA_CONFIG = {
  bootstrap: ["bootstrap.127.0.0.1.nip.io:9094"],
};

export const KUBERNETES_INTERNAL_SERVICE_MAP = {
  bootstrap: ["kafka-cluster-dual-role-0.kafka.svc.cluster.local:9094"],
};

export function getKafkaConfig(ENV: "production" | "development") {
  if (ENV === "production") {
    return KUBERNETES_INTERNAL_SERVICE_MAP;
  } else {
    return LOCAL_KAFKA_CONFIG;
  }
}
