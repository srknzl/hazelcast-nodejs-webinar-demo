const {Client} = require('hazelcast-client');

const express = require('express');



(async () => {
    const hazelcastClient = await Client.newHazelcastClient();

    const sessionMap = await hazelcastClient.getMap('session');
    await sessionMap.set('user', 1);
    const app = express();


    app.get('/', async (req, res, next) => {
        const user = await sessionMap.get('user');
        res.status(200).send(user.toString());
    });

    app.listen(3000, () => {
        console.log('Server is started..');
    });
})();
