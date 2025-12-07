import { kafkaObj } from "./_00_kafka_obj.js";

async function consume() {
    const consumer = kafkaObj.consumer({ groupId: 'test_consumer_group' })

    try {
        await consumer.connect()
        console.log('Consumer connected')

        // subscribe accepts a single topic name (string) or a RegExp
        await consumer.subscribe({ topic: 'topic-1', fromBeginning: true })

        console.log('consumer subscribed')

        // start consuming (example handler)
        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                const value = message.value 
                console.log(`message received ${topic}[${partition}]: ${value}`)
            },
        })
    } catch (err) {
        console.error(err)
    } finally {
        // await consumer.disconnect()
    }
}

consume()
