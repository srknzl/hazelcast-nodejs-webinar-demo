'use strict';
const {Client} = require('hazelcast-client');

const express = require('express');

const blogPost = 'This is a sample blog post. This is the body of the blog. Have a good day!';
const maxFibonacci = 75; // Maximum allowed integer in computeFibonacci, the bigger numbers will exceed Number.MAX_SAFE_INTEGER

(async () => {
    const addMapEntryListener = async () => {
        await fibonacciMap.addEntryListener({
            added: (mapEvent) => {
                console.log(`Key ${mapEvent.key} is added with value ${mapEvent.value}`);
            },
            expired: (mapEvent) => {
                console.log(`Key ${mapEvent.key} is evicted`);
            }
        }, undefined, true);
    };

    // Returns nth fibonacci, recursion based.
    // O(2^n) time complexity.
    const computeFibonacci = async (n) => {
        const cachedValue = await fibonacciMap.get(n);
        if(cachedValue !== null){
            return cachedValue;
        }
        if(n === 0){
            return 0;
        }
        if(n == 1){
            return 1;
        }
        // cache the computed value for future use
        const result = await computeFibonacci(n - 1) + await computeFibonacci(n - 2);
        await fibonacciMap.set(n, result, undefined, 10000);
        return result;
    };


    const hazelcastClient = await Client.newHazelcastClient();

    const fibonacciMap = await hazelcastClient.getMap('fibonacci');
    await addMapEntryListener();

    const atomicCounter = await hazelcastClient.getCPSubsystem().getAtomicLong('counter');

    const app = express();

    const endpoints = ['/blog', '/fibonacci/1']

    app.get('/', async (req, res, next) => {
        res.setHeader('Content-Type', 'text/html');
        res.write('<p>Available endpoints are:</p>');
        res.write('<ul>');
        for(const endpoint of endpoints){
            res.write(`<li><a href=${endpoint}>${endpoint}</li>`)
        }
        res.write('</ul>');
        res.status(200)
        res.end();
    });

    app.get('/blog', async (req, res, next) => {
        const viewCount = await atomicCounter.addAndGet(1);
        res.status(200).send(`<h1>Sample blog</h1> <p>${blogPost}</p> <p>Viewed ${viewCount} times</p>`);
    });

    app.get('/fibonacci/:n', async (req, res, next) => {
        let n = req.params.n;
        
        try {
            n = +n;
            if(!Number.isInteger(n) || n > maxFibonacci){
                throw new RangeError(`Expected an integer that is less than or equal to ${maxFibonacci}`);
            }
        } catch (error) {
            return res.status(400).send(`<p>Bad argument ${req.params.n}! ${error.message}</p>`);
        }

        const startTime = process.hrtime.bigint();
        const result = await computeFibonacci(n);
        const endTime = process.hrtime.bigint();

        const timeElapsed = endTime - startTime;
        return res.status(200).send(`<p>Result ${result} is computed in ${timeElapsed / 1000n} microseconds</p>`);

    });

    app.listen(3000, () => {
        console.log('Server is started..');
    });
})();
