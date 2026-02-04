FROM quay.io/strimzi/kafka:0.45.1-kafka-3.9.1

ARG DEBEZIUM_VERSION=3.2.1.Final
ENV DEBEZIUM_VERSION=${DEBEZIUM_VERSION}
ENV KAFKA_CONNECT_PLUGINS_DIR=/opt/kafka/plugins/debezium

USER root:root
RUN mkdir -p $KAFKA_CONNECT_PLUGINS_DIR

COPY debezium-connector-postgres-$DEBEZIUM_VERSION-plugin.tar.gz $KAFKA_CONNECT_PLUGINS_DIR/debezium-postgres-plugin.tar.gz

RUN tar -xzf $KAFKA_CONNECT_PLUGINS_DIR/debezium-postgres-plugin.tar.gz -C $KAFKA_CONNECT_PLUGINS_DIR;