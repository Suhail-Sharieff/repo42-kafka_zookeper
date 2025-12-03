## Commands for OLDER versions ONLY, refer compose file for latest
- For older versions, kafka uses zookepper, a manager for hadling kafka broker's events
- Turn on zookeeper
```
docker run -p 2181:2181 -d zookeeper
```
- Launch Kafka broker
```
docker run -p 9092:9092 \
-e KAFKA_ZOOKEEPER_CONNECT=<Ipv4 address>:2181 \
-e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://<Ipv4 addr>:9092 \
-e KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1 \
confluentinc/cp-kafka:7.5.0
```
- example
```
docker run -d -p 9092:9092 \
-e KAFKA_ZOOKEEPER_CONNECT=192.168.1.7:2181 \
-e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://192.168.1.7:9092 \
-e KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1 \
confluentinc/cp-kafka:7.5.0
```
- idk abt new version, it just asks some extra env vars