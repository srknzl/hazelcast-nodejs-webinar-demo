'use strict';
const { Client } = require('hazelcast-client');

(async () => {
    let registrationID;

    const hazelcastClient = await Client.newHazelcastClient();

    const topic = await hazelcastClient.getReliableTopic('topic');

    const shutdown = async () => {
        if (topic.removeMessageListener(registrationID)) {
            console.log('Removed message listener');
        } else {
            console.log('Could not remove message listener');
        }
        await hazelcastClient.shutdown();
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
    process.on('SIGHUP', shutdown);

    registrationID = topic.addMessageListener(message => {
        console.log(message.messageObject);
    });
})();
