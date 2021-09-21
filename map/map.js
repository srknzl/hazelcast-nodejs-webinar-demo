
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
        },
        updated: (event) => {
            console.log(`Updated entry with key ${event.key} from ${event.oldValue} to ${event.value}`)
        }
    }, undefined, true);

    await map.set('name', 'Serkan');

    console.log(await map.get('name')); // Serkan

    await map.set('name', 'Mustafa');

    console.log(await map.size()); // 1
    console.log(await map.get('name')); // Mustafa

    await map.delete('name');

    console.log(await map.size()); // 0
    console.log(await map.get('name')); // null

    await client.shutdown();
}

main().catch(console.error);