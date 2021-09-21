'use strict';
const { Client } = require('hazelcast-client');

const watchInterval = 1000;

(async () => {
    const hazelcastClient = await Client.newHazelcastClient();

    let interval;

    const shutdown = async () => {
        clearInterval(interval);
        await hazelcastClient.shutdown();
    };

    process.on('SIGINT', shutdown);

    const queue = await hazelcastClient.getQueue('jobs');

    interval = setInterval(async () => {
        try {
            console.log(`There are ${await queue.size()} items in the queue`);
        } catch (error) {
            console.log(`An error is occurred ${error}`);
        }
    }, watchInterval);
})().catch(console.error);
