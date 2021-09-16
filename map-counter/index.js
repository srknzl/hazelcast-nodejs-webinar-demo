'use strict';
const { Client } = require('hazelcast-client');
const long = require('long');
const express = require('express');

(async () => {
    // Calculates nth fibonacci number using recursion.
    const computeFibonacci = async (n) => {
        if (n === 0) return long.fromNumber(0);
        if (n === 1) return long.fromNumber(1);
        
        // Return from cache if exists.
        const cachedValue = await fibonacciMap.get(long.fromNumber(n));
        if (cachedValue !== null) return cachedValue;
    
        // fn = fn-1 + fn-2
        const long1 = await computeFibonacci(n - 1);
        const long2 = await computeFibonacci(n - 2)
        const result = long1.add(long2);
        
        // cache the computed value for future use
        await fibonacciMap.set(long.fromNumber(n), result, undefined, 20000);
        return result;
    };


    const hazelcastClient = await Client.newHazelcastClient();

    const fibonacciMap = await hazelcastClient.getMap('fibonacci');
    await fibonacciMap.addEntryListener({
        added: (mapEvent) => {
            console.log(`Key ${mapEvent.key} is added with value ${mapEvent.value}`);
        },
        expired: (mapEvent) => {
            console.log(`Key ${mapEvent.key} is expired`);
        }
    }, undefined, true);

    const counter = await hazelcastClient.getPNCounter('viewCounter');

    const app = express();
    const routes = ['/blog', '/fibonacci/0']

    app.get('/', async (req, res, next) => {
        res.setHeader('Content-Type', 'text/html');
        res.write('<p>Available pages are:</p>');
        res.write('<ul>');
        for (const route of routes) {
            res.write(`<li><a href=${route}>${route}</li>`)
        }
        res.write('</ul>');
        res.status(200)
        res.end();
    });

    app.get('/blog', async (req, res, next) => {
        const viewCount = await counter.addAndGet(1);
        res.status(200).send(`<h1>Sample blog</h1> <p>Have a good day!</p> <p>Viewed ${viewCount} times</p> <a href="/">Go back</a>`);
    });

    app.get('/fibonacci/:n', async (req, res, next) => {
        let n = req.params.n;

        try {
            n = +n;
            if (!Number.isInteger(n)) {
                throw new RangeError(`Expected an integer.`);
            }
        } catch (error) {
            return res.status(400).send(`<p>Bad argument ${req.params.n}! ${error.message}</p>`);
        }

        const startTime = process.hrtime.bigint();
        const result = await computeFibonacci(n);
        const endTime = process.hrtime.bigint();

        const timeElapsed = endTime - startTime;
        return res.status(200).send(`<p>Result ${result} is computed in ${timeElapsed / 1000n} microseconds</p> <a href="/">Go back</a>`);

    });

    app.listen(3000, () => {
        console.log('Server is started..');
    });
})().catch(console.error);
