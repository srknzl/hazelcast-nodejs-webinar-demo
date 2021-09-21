'use strict';
const { Client } = require('hazelcast-client');

const productionFrequency = 1000;

(async () => {
    const hazelcastClient = await Client.newHazelcastClient();
    let interval;

    const shutdown = async () => {
        clearInterval(interval);
        await hazelcastClient.shutdown();
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
    process.on('SIGHUP', shutdown);
    
    const queue = await hazelcastClient.getQueue('jobs');
    let counter = 1;
    interval = setInterval(async () => {
        try {
            console.log(`Added ${counter} to the queue`);
            await queue.add(counter);
            if(counter === Number.MAX_SAFE_INTEGER){ // reset counter if it is too big
                counter = 1;
            }
            counter++;
        } catch (error) {
            console.log(error);
        }
    }, productionFrequency);
})().catch(console.error);
