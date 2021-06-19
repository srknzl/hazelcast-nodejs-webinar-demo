'use strict';
const { Client } = require('hazelcast-client');

// Returns a promise that resolves after some milliseconds
const promiseWaitMilliseconds = milliseconds => {
    return new Promise(((resolve) => {
        setTimeout(() => {
            resolve();
        }, milliseconds);
    }));
};

const doJob = async () => {
    // A job that takes time
    await promiseWaitMilliseconds(1000);
    // console.log(`${new Date().toISOString()} Important work...`);
};

(async () => {
    const hazelcastClient = await Client.newHazelcastClient();
    let stop = false;

    const lock = await hazelcastClient.getCPSubsystem().getLock('lock');

    const shutdown = async () => {
        stop = true;
        await hazelcastClient.shutdown();
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
    process.on('SIGHUP', shutdown);

    while (!stop) {
        try {
            const fence = await lock.lock();
            try {
                console.log(`${new Date().toISOString()} Got the lock`);
                await doJob();
            } catch (error) {
                console.log(`An error is occured during doing job ${error}`);
            } finally {
                await lock.unlock(fence);
                console.log(`${new Date().toISOString()} Unlocked the lock`);
            }
        } catch (error) {
            console.log(`Cannot acquire lock ${error}`);
        }
    }
})();
