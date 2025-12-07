
import { Kafka } from "kafkajs"
const KAFKA_PORT = 9092

const kafkaObj = new Kafka({
    brokers: [`localhost:${KAFKA_PORT}`],//in production we will have many brokers of kafka
    clientId: "someID",
    connectionTimeout:1000
})


export {kafkaObj}