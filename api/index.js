const {Client} = require('hazelcast-client');

const express = require('express');
const session = require('express-session');
const {json} = require('body-parser');

const HazelcastStore = require('connect-hazelcast')(session);
const PgStore = require('connect-pg-simple')(session);


const blogPost = 'This is a sample blog post. In this blog post we will not say anything. Have a good day!';
const maxFibonacci = 100; // Maximum allowed integer in computeFibonacci

(async () => {
    const hazelcastClient = await Client.newHazelcastClient({
        network: {
            clusterMembers: ['hazelcast:5701']
        }
    });

    const fibonacciMap = await hazelcastClient.getMap('fibonacci');
    const counterMap = await hazelcastClient.getMap('counter');

    // Returns nth fibonacci, recursion based.
    // O(2^n) time complexity.
    const computeFibonacci = async (n) => {
        const cachedValue = await fibonacciMap.get(n);
        if(cachedValue !== null){
            return cachedValue;
        }
        if(!Number.isInteger(n) || n > maxFibonacci){
            return undefined;
        }
        if(n === 0 || n == 1){
            return 1;
        }
        // cache the computer value for future use
        const result = await computeFibonacci(n - 1) + await computeFibonacci(n - 2);
        await fibonacciMap.set(n, result);
        return result;
    };

    
    

    const app = express();

    app.use(json());
    app.use(session({
        /*
        store: new PgStore({
            conObject: {
                user: 'postgres',
                database: 'postgres',
                password: 'password',
                host: 'db',
                port: 5432
            }
        }),
        */
        // /*
        store: new HazelcastStore({
            client: hazelcastClient
        }),
        // */
        secret: 'shhhh',
        resave: false,
        saveUninitialized: true,
        cookie: { 
            secure: false,
            maxAge: 86400 // a day
        }
    }));

    app.get('/', async (req, res, next) => {
        res.status(200).send('Up an running..');
    });

    app.post('/login', (req, res, next) => {
        const username = req.body.username;
        const password = req.body.password;

        res.status(200).send(user.toString());
    });

    app.get('/blog', async (req, res, next) => {
        let count = await counterMap.get('count');
        if(count === null){ // the key does not exists
            count = 1;
        }
        res.status(200).send(`<h1>Sample blog</h1> <p>${blogPost}</p> <p>Viewed ${count} times</p>`);
        // increment count and set it
        count++; 
        await counterMap.set('count', count);
    });

    app.get('/fibonacci', async (req, res, next) => {
        const n = req.query.n;
        if(!n){
            return res.status(400).send('Please give me n query parameter');
        }
        const startTime = process.hrtime.bigint();
        const result = await computeFibonacci(+n);
        const endTime = process.hrtime.bigint();
        const timeElapsed = endTime - startTime;
        if(result === undefined){ // error happened inside computeFibonacci
            return res.status(400).send(`<p>N is invalid, please give integer less than or equal to ${maxFibonacci}: ${n}</p>`);
        } else {
            return res.status(200).send(`<p>Result ${result} is computed in ${timeElapsed / 1000n} microseconds</p>`);
        }
        
    });

    app.listen(3000, () => {
        console.log('Server is started..');
    });
})();