import k from "knex"

const knex = k({
    client: 'mysql',
    version: '5.6',
    connection: {
        host : 'localhost',
        port : 3306,
        user : 'inlable',
        database : 'inlable_blogs',
        password : 'inlable'
    }
})

knex.schema.hasTable('blogposts').then((doesExist) => {
    if (!doesExist) {
        return knex.schema.createTable('blogposts', (table) => {
            table.increments('id').primary()
            table.string('topic', 100).unique()
            table.string('article', 10000)
        });
    }
}).catch((error) => {
    console.log('[Knex] ', error)
})

export default knex