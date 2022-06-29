const express = require('express');
const app = express();
const pgp = require('pg-promise')();
const cn = {
    host: 'ec2-18-204-142-254.compute-1.amazonaws.com',
    port: 5432,
    database: 'db5s64ngf57vv2',
    user: 'tgdddrapevzbcr',
    password: '2ba4e48d7f53370170370b991078555b93bc9bd0f2e83fe63d07f1f5b3fe9ab0',
    ssl: { rejectUnauthorized: false }
}
const db = pgp(cn);
const PORT = 4320;

app.use(express.urlencoded());
app.use(express.json());



//GET ALL TABLES
app.get('/getall', (req,res) => {
    db.any(`SELECT users.name, tasks.todo FROM users INNER JOIN tasks ON users.id = tasks.user_id`)

    .then(function(data) {
        // success;
        // console.log(data)
        res.send(data);
    })
    .catch(function(error) {
        // error;
        console.log(error)
    });
    // res.send('Hello')

});
//ADD USERS + TASKS
app.post('/adduser', (req,res) => {
    const {name} = req.body;
    db.none(`INSERT INTO users (name) VALUES ($1)`, [name])
    res.send(req.body)
});

app.post('/addtask', (req,res) => {
    const {todo, user_id} = req.body;
    db.none(`INSERT INTO tasks (todo, user_id) VALUES ($1, $2)`, [todo, user_id])
    res.send(req.body)
});

//DELETE USERS + TASKS
app.delete('/deleteuser', (req, res) => {
    const {name} = req.body;
    db.none(`DELETE FROM users WHERE name = '${name}'`)
    res.send(req.body)
});

app.delete('/deletetask', (req, res) => {
    const {todo} = req.body;
    db.none(`DELETE FROM tasks WHERE todo = '${todo}'`)
    res.send(req.body)
});










app.listen(PORT, () => {
    console.log('Server listening on port ' + PORT)
});