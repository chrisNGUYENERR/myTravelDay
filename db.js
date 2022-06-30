const pgp = require('pg-promise')();


class DatabaseLibrary {
    constructor(){
        this.cn = {
            host: 'ec2-18-204-142-254.compute-1.amazonaws.com',
            port: 5432,
            database: 'db5s64ngf57vv2',
            user: 'tgdddrapevzbcr',
            password: '2ba4e48d7f53370170370b991078555b93bc9bd0f2e83fe63d07f1f5b3fe9ab0',
            ssl: { rejectUnauthorized: false }
        }
        this.db = pgp(this.cn);
    }

    async getAll() {
        return await this.db.any(`SELECT users.name, tasks.todo FROM users LEFT JOIN tasks ON users.id = tasks.user_id`)
    }


    async insertOne(table, data) {
        return await this.db.none(`
        INSERT INTO ${table} (name) VALUES ($1)`, data)
    }


}

module.exports = new DatabaseLibrary()