'use strict';
const { Client } = require('hazelcast-client');

// The maximum amount that a consumer will wait. The actual waited milliseconds will be between 0-maxWaitMilliseconds chosen randomly
const maxWaitMilliseconds = 50;
// The maximum amount that processing a job will take. The actual waited milliseconds will be between 0-maxProcessTime chosen randomly
const maxProcessTime = 50;
// enables logs
const debugLogs = false;

// Returns a promise that resolves after some milliseconds
const promiseWaitMilliseconds = milliseconds => {
    return new Promise(((resolve) => {
        setTimeout(() => {
            resolve();
        }, milliseconds);
    }));
};

const doJob = async job => {
    // A job that takes time
    await promiseWaitMilliseconds(Math.random() * maxProcessTime);
    if(debugLogs)console.log(`The result is ${job * 2 + 1}`);
};

(async () => {
    let registrationID;

    const hazelcastClient = await Client.newHazelcastClient();

    const queue = await hazelcastClient.getQueue('jobs');

    const shutdown = async () => {
        await hazelcastClient.shutdown();
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
    process.on('SIGHUP', shutdown);

    let nextWaitTime = maxWaitMilliseconds * Math.random(); // random wait between 0-maxWaitMilliseconds ms

    const getNextJob = async () => {
        try {
            const job = await queue.poll();
            if (job === null) {
                if(debugLogs)console.log('No jobs available waiting..');
            } else {
                if(debugLogs)console.log(`Processing job: ${job}`);
                await doJob(job);
            }
            nextWaitTime = maxWaitMilliseconds * Math.random();
            setTimeout(getNextJob, nextWaitTime);
        } catch (error) {
            console.log(`An error occurred ${error}`);
        }
    };
    // initiate the first job
    setTimeout(getNextJob, nextWaitTime);
})();
