
const {Client} = require('hazelcast-client');

async function main(){
    const client = await Client.newHazelcastClient();
    
    const map = await client.getMap('sessions');

    const entries = await map.entrySet();

    for(const [key, value] of entries) {
        console.log(`${key} -> ${JSON.stringify(value)}`);
    }

    await client.shutdown();
}

main().catch(console.error);