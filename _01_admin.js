import { Kafka } from "kafkajs"

//first we need to create admin for Kafka broker
// run cmds in README.md, i have set kafka broker to run @ port 9092

const KAFKA_PORT = 9092

const kafkaObj = new Kafka({
    brokers: [`localhost:${KAFKA_PORT}`],
    clientId: "someID"
})


async function init_kafka() {
    try {
        const admin = kafkaObj.admin()

        //now admin will create topics in that

        // const res = await admin.createTopics({
        //     topics: [
        //         {
        //             topic: 'topic-1',
        //             // configEntries:1,
        //             // numPartitions:1,
        //             // replicaAssignment:1,
        //             // replicationFactor:1
        //         }
        //     ]
        // })

        // console.log("Admin", res);
        const topics=await admin.listTopics()
        console.log("topics",topics);

        admin.disconnect()
        


    } catch (err) {
        console.log(err);
    }

}

init_kafka()
