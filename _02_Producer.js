import { kafkaObj } from "./_00_kafka_obj.js";



async function produce() {
    const producer = kafkaObj.producer()
    try {
        await producer.connect()
        console.log(`Producer connected...`);

        const data = {
            topic: 'topic-1',
            messages: [
                {
                    key: `${Date.now()}`,
                    /*Key

The message key is used to decide which partition the message will be sent to. This is important to ensure that messages relating to the same aggregate are processed in order. For example, if you use an orderId as the key, you can ensure that all messages regarding that order will be processed in order.

By default, the producer is configured to distribute the messages with the following logic:

    If a partition is specified in the message, use it
    If no partition is specified but a key is present choose a partition based on a hash (murmur2) of the key
    If no partition or key is present choose a partition in a round-robin fashion
 */
                    value: 'Hello Suhail Sharieff',
                    partition: 0,
                    headers: {
                        'correlation-id': '2bfb68bb-893a-423b-a7fa-7b568cad5b67',
                        'system-id': 'my-system',
                    }
                }
            ]
        }

        /*hconst topicMessages = [
  {
    topic: 'topic-a',
    messages: [{ key: 'key', value: 'hello topic-a' }],
  },
  {
    topic: 'topic-b',
    messages: [{ key: 'key', value: 'hello topic-b' }],
  },
  {
    topic: 'topic-c',
    messages: [
      {
        key: 'key',
        value: 'hello topic-c',
        headers: {
          'correlation-id': '2bfb68bb-893a-423b-a7fa-7b568cad5b67',
        },
      }
    ],
  }
]
await producer.sendBatch({ topicMessages }) */

        const recordMetaData = await producer.send(data);

        console.log('data sent', recordMetaData);





    } catch (err) {
        console.log('error', err);
    }
    finally {
        await
            producer.disconnect()
    }
}

produce()
/**const transaction = await producer.transaction()

try {
  await transaction.send({ topic, messages })

  await transaction.commit()
} catch (e) {
  await transaction.abort()
} */