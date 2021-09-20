
const {Client} = require('hazelcast-client');

async function main(){
    const client = await Client.newHazelcastClient();
    
    const map = await client.getMap('myMap');
    await map.addEntryListener({
        added: (event) => {
            console.log(`Added entry: ${event.key} -> ${event.value}`)
        },
        removed: (event) => {
            console.log(`Removed entry with key ${event.key}`)
        }
    }, undefined, true);

    await map.put('name', 'Serkan');
    await map.put('surname', 'Ozel');

    console.log(await map.size()); // 2
    console.log(await map.get('name')); // Serkan

    await map.delete('name');
    await client.shutdown();
}

main().catch(console.error);