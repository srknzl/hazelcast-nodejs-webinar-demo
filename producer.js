'use strict';
const { Client } = require('hazelcast-client');

(async () => {
    const hazelcastClient = await Client.newHazelcastClient();

    const topic = await hazelcastClient.getReliableTopic('topic');
    let counter = 1;
    setInterval(async () => {
        console.log('Published', counter);
        await topic.publish(counter);
        counter++;
    }, 1000);
})();
