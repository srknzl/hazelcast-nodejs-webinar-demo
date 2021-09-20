
const {Client} = require('hazelcast-client');

async function createMapping(client) {
    await client.getSqlService().execute(`
    
    CREATE MAPPING IF NOT EXISTS sessions  (
        __key VARCHAR
    )
    TYPE IMap
    OPTIONS (
        'keyFormat' = 'varchar',
        'valueFormat' = 'json')
    `).getUpdateCount();
}

async function main(){
    const client = await Client.newHazelcastClient();

    await createMapping(client);

    const result = client.getSqlService().execute('SELECT __key, this FROM sessions');

    for await (const row of result) {
        console.log(JSON.stringify(row));
    }

    await client.shutdown();
}

main().catch(console.error);