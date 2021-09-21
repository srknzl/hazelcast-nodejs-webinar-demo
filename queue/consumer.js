'use strict';
const { Client } = require('hazelcast-client');

// The maximum amount that processing a job will take. The actual waited milliseconds will be between 0-maxProcessTime chosen randomly
const maxProcessTime = 2000;

const doJob = async job => {
    // A job that takes time
    const waitMilliSeconds = Math.random() * maxProcessTime;
    return new Promise(((resolve) => {
        setTimeout(() => {
            console.log(`Processed ${job}, the result is ${job * 2 + 1}`);
            resolve();
        }, waitMilliSeconds);
    }));
};

(async () => {
    const hazelcastClient = await Client.newHazelcastClient();
    const queue = await hazelcastClient.getQueue('jobs');

    const shutdown = async () => {
        await hazelcastClient.shutdown();
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
    process.on('SIGHUP', shutdown);

    const getJob = async () => {
        try {
            const job = await queue.poll();
            if (job === null) {
                console.log('No jobs available waiting 5 seconds..');
                setTimeout(getJob, 5000);
            } else {
                await doJob(job);
                setImmediate(getJob);
            }
        } catch (error) {
            console.log(`An error occurred ${error}`);
        }
    };
    // initiate the first job
    getJob();
})().catch(console.error);
