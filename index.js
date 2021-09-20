'use strict';
const { Client } = require('hazelcast-client');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const HazelcastStore = require('connect-hazelcast')(session);


(async () => {
    const client = await Client.newHazelcastClient();
    const sessionsMap = await client.getMap('sessions');

    await sessionsMap.addEntryListener({
        added: (event) => {
            console.log(`Added entry: ${event.key} -> ${event.value}`)
        },
        removed: (event) => {
            console.log(`Removed entry: ${event.key} -> ${event.value}`)
        }
    }, undefined, true);

    const app = express();

    app.use(bodyParser.urlencoded());
    app.use(session({
        store: new HazelcastStore({
            client: client,
            prefix: 'sessions'
        }),
        secret: 'secret'
    }));

    app.set('view engine', 'pug');
    app.set('views', '.');

    app.get('/', async (req, res, next) => {
        res.setHeader('Content-Type', 'text/html');
        if (req.session.username) {
            res.status(200).render('loggedIn', { username: req.session.username, orders: req.session.orders });
        } else {
            res.status(200).sendFile(path.join(__dirname, 'index.html'));
        }
    });

    app.get('/wrongLogin', async (req, res, next) => {
        res.status(200).sendFile(path.join(__dirname, 'wrongLogin.html'));
    });

    app.post('/login', async (req, res, next) => {
        const username = req.body.username;
        const password = req.body.password;

        if (username === 'serkan' && password === '123') {
            req.session.username = 'serkan';
            req.session.orders = ['laptop', 'book', 'bread'];
        } else if(username === 'mustafa' && password === '456') {
            req.session.username = 'mustafa';
            req.session.orders = ['mouse', 'monitor', 'coffee'];
        } else {
            return res.status(401).redirect('/wrongLogin');
        }
        res.status(200).redirect('/');
    });

    app.post('/logout', async (req, res, next) => {
        req.session.destroy(() => {
            res.redirect('/');
        });
    });

    app.listen(3000, () => {
        console.log('Server is started at http://localhost:3000..');
    });
})().catch(console.error);
