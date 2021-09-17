
const {Client} = require('hazelcast-client');

async function main(){
    const client = await Client.newHazelcastClient();
    
    const map = await client.getMap('myMap');

    await map.put('name', 'Serkan');
    await map.put('surname', 'Ozel');

    console.log(await map.size()); // 2
    console.log(await map.get('name')); // Serkan

    await map.delete('name');
    await client.shutdown();
}

main().catch(console.error);