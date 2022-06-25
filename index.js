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

app.get('/', (req,res) => {
    db.any('SELECT * FROM t')

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












app.listen(PORT, () => {
    console.log('Server listening on port ' + PORT)
});