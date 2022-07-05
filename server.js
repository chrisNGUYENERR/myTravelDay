const express = require('express');
const app = express();
const es6Renderer = require('express-es6-template-engine');
const pgp = require('pg-promise')();
const cn = {
    host: 'ec2-18-204-142-254.compute-1.amazonaws.com',
    port: 5432,
    database: 'db5s64ngf57vv2',
    user: 'tgdddrapevzbcr',
    password: '2ba4e48d7f53370170370b991078555b93bc9bd0f2e83fe63d07f1f5b3fe9ab0',
    ssl: { rejectUnauthorized: false }
};
const db = pgp(cn);
const bcrypt = require('bcrypt');
const PORT = 4320;

app.engine('html', es6Renderer);
app.set('views', 'templates');
app.set('view engine', 'html');

app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded());
app.use(express.json());
app.use((req,res,next) => {
    console.log(`Path: ${req.path}`)
    next()
});




//GET TABLES
app.get('/', (req,res) => {
    res.send('Hello');
})


app.get('/getall', async (req,res) => {
    try {
        let response = await db.any(`SELECT users.username, tasks.todo FROM users LEFT JOIN tasks ON users.id = tasks.user_id`)
        //renders undefined as username
        res.render('userTodos', {
            locals: {
                data: response
            }
        })
    } catch (error) {
        res.send({
            error, 
            msg: 'Failed to retrieve users and todos'
        })
    }
});

app.get('/getusertodos', async (req,res) => {
    const {username} = req.body;
    try {
        let response =  await db.any(`SELECT users.username, tasks.todo FROM users LEFT JOIN tasks ON users.id = tasks.user_id WHERE users.username = '${username}'`)
        // console.log(response)
        res.render('userTodos', {
            locals: {
                data: response
            }
        })
    } catch (error) {
        res.send({
            error,
            msg: 'Failed to retrieve user and todos'
        })
    }
});

//LOGIN
app.get('/login', (req,res) => {
    res.render('login', {
        locals: {
            error: null
        },
        partials: {
            bootstrap: './templates/partials/bootstrap.html',
            navbar: './templates/partials/nav.html'
        }
    });
});

app.post('/login', (req,res) => {
    const {username, password} = req.body;

    db.any(`SELECT username, password FROM users WHERE username = '${username}'`)
    .then(user => {
        bcrypt.compare(password, user[0].password, (err, match) => {
            if (match) {
                res.send('Successful login')
            } else {
                res.send('Unable to login')
            }
        });
    });
});


//REGISTER
app.get('/register', (req,res) => {
    res.render('register', {
        locals: {
            error: null
        },
        partials: {
            bootstrap: './templates/partials/bootstrap.html',
            navbar: './templates/partials/nav.html'
        }
    });
});

app.post('/register', async (req,res) => {
    const {username, password} = req.body;
    bcrypt.hash(password, 10, (err, hash) => {
        db.none(`INSERT INTO users (username, password) VALUES ($1, $2)`, [username, hash])
        .then((result) => {
            return res.redirect('/');
        });
    });
});

//ADD USERS + TASKS
app.post('/insertuser', (req,res) => {
    const {name} = req.body;
    db.none(`INSERT INTO users (name) VALUES ($1)`, [name])
    console.log(req.body);
    res.send(req.body)
});

app.post('/inserttask', (req,res) => {
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