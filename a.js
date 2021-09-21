
const {Client} = require('hazelcast-client');

async function main(){
    const client = await Client.newHazelcastClient();
    
    const map = await client.getMap('myMap');
    await map.set('session1', {
        username: 'serkan',
        orders: ['laptop', 'book', 'bread']
    });

    console.log(await map.get('session1')) // { username: 'serkan', orders: [ 'laptop', 'book', 'bread' ] }
}

main();