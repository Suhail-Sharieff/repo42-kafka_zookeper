

//first we need to create admin for Kafka broker
// run cmds in README.md, i have set kafka broker to run @ port 9092

import { kafkaObj } from "./_00_kafka_obj.js";

async function init_kafka() {
    const admin = kafkaObj.admin()
    try {
        

      

        //admin creates topics

        const res = await admin.createTopics({
            topics: [
                {
                    topic: 'topic-1',
                    // configEntries:1,
                    // numPartitions:1,
                }
            ]
        })

        // console.log("Admin", res);
        const topics=await admin.listTopics()
        console.log("topics",topics);

     

        // const x=await admin.fetchTopicMetadata();

        // console.log(x);
        

        


    } catch (err) {
        console.log(err);
    }finally{
        await admin.disconnect()
    }

}

init_kafka()
