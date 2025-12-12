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

## Latest versions
- The older version used open source Zookeper to manage kafka, so we had to separately instsll zookeeper to manage kafka, but in the latest versions kafka image comes with kafka raft, which acts as inbuilt manager for kafka
- So just run `docker compose up -d`
# Glossary

## Cluster
The collective group of machines that Kafka is running on.

## Broker
A single Kafka instance.

## Topic
Topics are used to organize data. You always read and write to/from a particular topic.

## Partition
Data in a topic is spread across a number of partitions. Each partition can be thought of as a log file, ordered by time.  
To guarantee ordering, only one member of a consumer group can read from a particular partition at a time.

## Producer
A client that writes data to one or more Kafka topics.

## Consumer
A client that reads data from one or more Kafka topics.

## Replica
Partitions are typically replicated to one or more brokers to avoid data loss.

## Leader
Although a partition may be replicated to one or more brokers, a single broker is elected the leader for that partition, and is the only one allowed to read or write to/from that partition.

## Consumer Group
A collective group of consumer instances, identified by a `groupId`.  
In a horizontally scaled application, each instance would be a consumer and together they would act as a consumer group.

## Group Coordinator
An instance in the consumer group responsible for assigning partitions to the consumers in the group.

## Offset
A certain point in the partition log.  
When a consumer has consumed a message, it "commits" that offset, meaning it tells the broker that the consumer group has consumed that message.  
If the group restarts, it will continue from the highest committed offset.

## Rebalance
When a consumer joins or leaves a consumer group (during boot or shutdown), the group must “rebalance”: a coordinator is chosen and partitions are reassigned among members.

## Heartbeat
The mechanism by which the cluster knows which consumers are alive.  
Each consumer periodically sends a heartbeat request (heartbeat interval). If it fails to do so within the session timeout, it is considered dead and removed, triggering a rebalance.
## Example Usage
- We will do task, send that its done, but heavy opr like DB inserts,updates we will assign to Kafka to handle
```js
import { Kafka } from "kafkajs";
import { asyncHandler } from "./AsyncHandler.utils.js";

const topicsToCreate = ["code_updates"];


// Parse brokers from env or default
const kafkaOrigin = process.env.KAFKA_ORIGIN
const rawBrokers = kafkaOrigin.split(',').map(broker => broker.trim()).filter(broker => broker);

// Function to parse broker string, handling URLs or plain host:port
const parseBroker = (broker) => {
    if (broker.startsWith('http://') || broker.startsWith('https://')) {
        // Remove protocol and extract host:port
        const withoutProtocol = broker.replace(/^https?:\/\//, '');
        return withoutProtocol;
    }
    return broker;
};

const brokers = rawBrokers.map(parseBroker);

// Validate brokers format
brokers.forEach(broker => {
    const [host, portStr] = broker.split(':');
    const port = parseInt(portStr, 10);
    if (!host || isNaN(port) || port < 0 || port > 65535) {
        throw new Error(`Invalid Kafka broker: ${broker}. Expected format: host:port`);
    }
});

const kafka = new Kafka(
    {
        clientId: "codemint_kafka_clientId",
        brokers: brokers,
        retry: {
            initialRetryTime: 100,
            retries: 8
        },
    }
)

const admin = kafka.admin()
const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: "codemint_kafka_groupId" });




export const connectKafka = async () => {
    try {
        console.log("Connecting to Kafka...");
        await producer.connect();
        await consumer.connect();
        await admin.connect();

        const existingTopics = await admin.listTopics();

        const newTopics = topicsToCreate
            .filter(t => !existingTopics.includes(t))
            .map(t => ({
                topic: t,
                numPartitions: 1,
                replicationFactor: 1
            }));

        if (newTopics.length > 0) {
            console.log(`⚠️ Creating topics: ${newTopics.map(t => t.topic).join(", ")}`);
            await admin.createTopics({ topics: newTopics });
            console.log("✅ Topics created.");
        }

        console.log("✅ Kafka Connected & Ready");
    } catch (err) {
        console.error("❌ Kafka Connection Error:", err);
    }
};
export const produceEvent = async (topic, message) => {
  try {
    console.log(`📤 KAFKA produced into topic=${topic} message=${message}`);
    
    await producer.send({
      topic,
      messages: [{ value: JSON.stringify(message) }],
    });
  } catch (err) {
    console.error(`Error producing to ${topic}:`, err);
  }
};

export const consumeEvents = async (topic, callback) => {
  try {
    await consumer.subscribe({ topic, fromBeginning: false });
    consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const parsedValue = JSON.parse(message.value.toString());
        console.log(`📥 KAFKA consumed from topic=${topic} message=${JSON.stringify(parsedValue)}`);
        callback(parsedValue);
      },
    });
  } catch (err) {
    console.error(`Error consuming ${topic}:`, err);
  }
};

//------------------how to use

import { db } from "./sql_connection.js";
import { ApiError } from "./Api_Error.utils.js";
import { ApiResponse } from "./Api_Response.utils.js";
export const testApi=asyncHandler(async(req,res)=>{
    try{
        await produceEvent("code_updates","100 insert queries")
        await consumeEvents("code_updates",async(data)=>{
            for(var i=1;i<=5000;i++){
                await db.execute('insert into messages(session_id,user_id,message) values(?,?,?)',[2,1,`Msg${i}`])
            }
        })

        return res.status(200).json(new ApiResponse(200,`Suhail API tested `))

    }catch(err){
        return res.status(400).json(new ApiError(400,err.message))
    }
})  

```
