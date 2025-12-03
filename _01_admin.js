import {Kafka} from "kafkajs"

//first we need to create admin for Kafka broker
// run cmds in README.md, i have set kafka broker to run @ port 9092

const KAFKA_PORT=9092

const kafkaObj=new Kafka({
    brokers:[`192.168.1.7/${KAFKA_PORT}`],
    clientId:"someID"
})


async function init_kafka(){
    const admin=kafkaObj.admin()
    
    //now admin will create topics in that

    await admin.createTopics({
        topics:[
            {
                topic:'topic-1',
                configEntries:1,
                numPartitions:1,
                replicaAssignment:1,
                replicationFactor:1
            }
        ]
    })

}